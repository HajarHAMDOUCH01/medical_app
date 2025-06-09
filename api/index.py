# your_nextjs_app_root/api/index.py

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
import requests # To make HTTP requests to your external model API
import os
from typing import Optional

# --- Configuration for your external Model API ---
# IMPORTANT: REPLACE THIS with the ACTUAL public URL of your deployed model API
# (from Hugging Face Spaces like https://your-username-your-space.hf.space
# or Render like https://your-api.onrender.com)
#
# For production on Vercel, you should set this as an Environment Variable
# in your Vercel project settings (e.g., named MODEL_API_BASE_URL).
# Example: https://vercel.com/docs/concepts/projects/environment-variables
MODEL_API_BASE_URL = os.getenv("MODEL_API_BASE_URL", "http://localhost:8000") # Fallback for local testing

app = FastAPI()

# --- Configure CORS ---
# IMPORTANT: Adjust origins to match your frontend's actual domains in production!
origins = [
    "http://localhost:3000",  # Your Next.js frontend during local development
    # Add your Vercel frontend deployment URL(s) here once you have them:
    # Example for Vercel default domains:
    "https://your-frontend-vercel-app.vercel.app",
    # You might want a wildcard for Vercel preview deployments if needed:
    "https://*.vercel.app",
    # If your Next.js app is deployed on a custom domain:
    # "https://your-custom-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# --- Pydantic Models ---

# This model defines the structure of the JSON response your Next.js frontend expects.
# Your external model API returns a plain string, so we'll put that string into the 'findings' field.
class AnalysisResponse(BaseModel):
    findings: str
    impression: str = "" # Placeholder, your current model returns only one string
    recommendation: str = "" # Placeholder

# This model defines the structure of the additional parameters sent from the Next.js frontend.
# It matches the parameters expected by your main model API's /generate_report endpoint.
class ReportGenerationParams(BaseModel):
    prompt_text: Optional[str] = None
    max_new_tokens: int = 100
    num_beams: int = 4
    do_sample: bool = False
    top_k: Optional[int] = None
    top_p: Optional[float] = None

# --- API Endpoints ---

# The main endpoint that your Next.js frontend will call
@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_xray(
    image: UploadFile = File(...),
    # Use Depends to parse the additional parameters from the request body
    params: ReportGenerationParams = Depends(ReportGenerationParams)
):
    """
    Endpoint to analyze X-ray images. This endpoint acts as a proxy,
    forwarding the request to the main model API deployed separately.
    """
    if not image:
        raise HTTPException(status_code=400, detail="No image file provided.")

    # Basic validation for image format
    if not image.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload PNG, JPG, or JPEG.")

    try:
        # Read the uploaded image file bytes from the frontend request
        image_bytes = await image.read()

        # --- Prepare the request for the external model API ---
        # `files` parameter for `requests.post` to send the image
        files = {'file': (image.filename, image_bytes, image.content_type)}
        
        # `data` parameter for `requests.post` to send the form-data parameters
        # FastAPI's generate_report_endpoint expects these as form fields.
        # Ensure numerical values are converted to strings for form-data, or handled by FastAPI on the other end.
        # Sending empty string for None values is a robust way to ensure they are included as form fields.
        data = {
            "prompt_text": params.prompt_text if params.prompt_text is not None else '',
            "max_new_tokens": str(params.max_new_tokens),
            "num_beams": str(params.num_beams),
            "do_sample": str(params.do_sample).lower(), # 'true' or 'false'
            "top_k": str(params.top_k) if params.top_k is not None else '',
            "top_p": str(params.top_p) if params.top_p is not None else '',
        }
        
        # Construct the full URL for the external model API's /generate_report endpoint
        external_api_url = f"{MODEL_API_BASE_URL}/generate_report"
        print(f"[{os.getenv('VERCEL_REGION', 'local')}] Forwarding request to external model API: {external_api_url}")

        # Make the POST request to your deployed model API
        response = requests.post(external_api_url, files=files, data=data)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        # Assuming your external model API's /generate_report endpoint returns a plain string report
        generated_report_text = response.text 
        print(f"[{os.getenv('VERCEL_REGION', 'local')}] Received report from external API (length: {len(generated_report_text)} chars).")

        # Return the result formatted into the AnalysisResponse for the Next.js frontend
        return AnalysisResponse(
            findings=generated_report_text,
            impression="", # Populate as needed if your external API returns more structured data
            recommendation="" # Populate as needed
        )

    except requests.exceptions.RequestException as e:
        # Handle connection errors or bad responses from the external API
        print(f"[{os.getenv('VERCEL_REGION', 'local')}] Error communicating with external model API: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to get response from model API: {e}. Please check the external API's status and logs.")
    except Exception as e:
        # Catch any other unexpected errors during processing or forwarding
        print(f"[{os.getenv('VERCEL_REGION', 'local')}] Unexpected error in proxy endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error in proxy: {e}. Please check proxy logs.")

# Health check endpoint for the proxy API
@app.get("/api/health")
async def health_check():
    """
    Health check for the Vercel API route.
    Optionally, you could try to ping your external model API here too.
    """
    try:
        # Ping the external model API's health endpoint
        external_health_url = f"{MODEL_API_BASE_URL}/health"
        response = requests.get(external_health_url, timeout=5) # Add timeout
        response.raise_for_status()
        external_api_status = response.json()
        model_api_status = external_api_status.get("status", "unknown")
        model_loaded = external_api_status.get("model_loaded", False)
        external_api_device = external_api_status.get("device", "unknown")
        
        return {
            "status": "ok",
            "proxy_ready": True,
            "external_model_api_status": model_api_status,
            "external_model_loaded": model_loaded,
            "external_model_device": external_api_device
        }
    except requests.exceptions.RequestException as e:
        return {
            "status": "warning",
            "proxy_ready": True,
            "external_model_api_status": "unreachable",
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": "error",
            "proxy_ready": True,
            "external_model_api_status": "health check failed",
            "error": str(e)
        }


# Root endpoint for the Vercel API route
@app.get("/")
async def root():
    return {"message": "Welcome to the Medical X-ray Analysis Proxy API! This forwards requests to the main model API."}
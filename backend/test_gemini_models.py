#!/usr/bin/env python3
"""
Test script to list available Gemini models with your API key
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✅ API Key found: {api_key[:10]}...{api_key[-4:]}")
print("\n🔍 Testing Gemini API connection...\n")

try:
    # Configure the API
    genai.configure(api_key=api_key)
    
    # List all available models
    print("📋 Available models:")
    print("-" * 60)
    
    models = genai.list_models()
    found_models = False
    
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            found_models = True
            print(f"✅ {model.name}")
            print(f"   Display Name: {model.display_name}")
            print(f"   Description: {model.description[:100]}...")
            print()
    
    if not found_models:
        print("❌ No models found that support generateContent")
        print("\nThis means your API key doesn't have access to Gemini models.")
        print("\nPossible solutions:")
        print("1. Go to https://makersuite.google.com/app/apikey")
        print("2. Generate a NEW API key")
        print("3. Make sure 'Generative Language API' is enabled")
        print("4. Update the GEMINI_API_KEY in Railway")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nYour API key might be invalid or doesn't have the right permissions.")


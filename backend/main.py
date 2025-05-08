from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import matplotlib.pyplot as plt
import os
import re
import json

from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk

# Make sure NLTK resources are downloaded (once at startup)
nltk.download('punkt')
nltk.download('stopwords')

# ================================
# Initialize FastAPI Application
# ================================
app = FastAPI()

# Define allowed origins for CORS (Cross-Origin Resource Sharing)
origins = ["http://localhost:3000"]

# Add middleware to allow CORS requests from specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the directory for storing uploaded files
UPLOAD_DIR = os.path.join(os.getcwd(), 'data', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Create directory if it doesn't exist

# ================================
# Route: Upload for Trends Analysis
# ================================
@app.post("/upload-trends/")
async def upload_trends_csv(file: UploadFile = File(...)):
    try:
        # where the raw CSV lives
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        # our cache file for this CSV: same name + .cache.json
        cache_path = os.path.splitext(file_path)[0] + ".cache.json"

        # If we've already processed this exact filename before, serve from cache
        if os.path.exists(file_path) and os.path.exists(cache_path):
            cached = json.load(open(cache_path, 'r', encoding='utf-8'))
            return JSONResponse(content={"year_keywords": cached})

        # Otherwise, save the incoming upload
        with open(file_path, 'wb') as f:
            f.write(await file.read())

        # Load the uploaded CSV file using pandas
        df = pd.read_csv(file_path, encoding="utf-8", delimiter=";", on_bad_lines='skip')

        # Check for required columns
        if 'FundingYear' not in df.columns or 'ProjectAbstractEn' not in df.columns:
            return JSONResponse(
                content={"error": "Missing 'FundingYear' or 'ProjectAbstractEn' column"},
                status_code=400
            )

        # Keep only relevant columns and drop rows with missing values
        df = df[['FundingYear', 'ProjectAbstractEn']].dropna()
        df['FundingYear'] = pd.to_numeric(df['FundingYear'], errors='coerce')
        df = df.dropna(subset=['FundingYear', 'ProjectAbstractEn'])

        # Group abstracts by year
        grouped = df.groupby('FundingYear')['ProjectAbstractEn'] \
                    .apply(lambda texts: ' '.join(texts)) \
                    .to_dict()

        result = {}
        nltk_stopwords = set(stopwords.words('english'))
        custom_stopwords = set([
            "project","goal","results","expected","purpose","approach","effects",
            "implementation","development","study","carried","research","work","new",
            "based","focus","studies","performed","data","analysis","result","aim",
            "provide","show","allow","used","support","application","proposed","also",
            "one","first","objectives","method","design","different","use","knowledge",
            "well","important","develop","using","och","developed","change","understanding",
            "methods","two","role","innovation","potential","within","international",
            "may","future","är","test","aims","novel","critical","visit","three",
            "swedish","use","usage","system","systems","model","models" ,"sweden", "parts", "with",
            "collaboration","process","time","production","technology","market","text" ,"maskinöversatt", "would", "university",
            "field","sedu","bleiker","activities","social","care","including" ,"high","several","companies",
            "av","information","risk","projects","plan","denna","group" ,"gothenburg","processes",
            "att","large","order","och","conference","investigate","partners" ,"identify","increase","business",
            "number","increased","control","solutions","specific","area","areas" ,"material","materials",
            "human","humans","many","possible","part","function","functions" ,"cell","cells","togheter"
        ])
        all_stopwords = nltk_stopwords.union(custom_stopwords)

        # Process each year's text
        for year, text in grouped.items():
            tokens = word_tokenize(text.lower())
            filtered = [w for w in tokens if w.isalpha() and w not in all_stopwords]
            if not filtered:
                continue

            joined = ' '.join(filtered)
            vec = TfidfVectorizer(max_features=50)
            tfidf = vec.fit_transform([joined])
            features = vec.get_feature_names_out()
            scores = tfidf.toarray()[0]
            top10 = sorted(zip(features, scores), key=lambda x: x[1], reverse=True)[:10]
            result[int(year)] = [word for word, _ in top10]

        # Save the computed result to cache so next time is instantaneous
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        return JSONResponse(content={"year_keywords": result})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ================================
# Route: Upload for Visualize Page (Project Themes)
# ================================
@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, 'wb') as f:
            f.write(await file.read())

        data = pd.read_csv(file_path, encoding="utf-8", delimiter=";", on_bad_lines='skip')
        if data.empty:
            return JSONResponse(content={"error": "The CSV file is empty."}, status_code=400)
        if 'Scbs' not in data.columns:
            raise ValueError("The 'Scbs' column is missing in the uploaded CSV.")

        def preprocess_text(text):
            return re.sub(r'[^a-zA-ZåäöÅÄÖ\s:]', '', text).lower()

        def extract_first_word_after_colon(text):
            text = preprocess_text(text)
            if ":" in text:
                after = text.split(":", 1)[1].strip()
                words = after.split()
                if words:
                    return words[0]
            return None


    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ================================
# Serve static files (e.g., chart images)
# ================================
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")


# Run in backend C:\TNM094\project\react_testing\backend> with this in terminal: uvicorn main:app --reload

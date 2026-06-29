from dotenv import load_dotenv
from supabase import create_client
from supabase import create_client, Client
load_dotenv()

import os
import uuid
import bcrypt
from jose import jwt
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Configuration
MONGO_URL = "mongodb+srv://fonzomun:mapachex1@cluster0.t9qxth8.mongodb.net/lumina?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = os.environ.get("DB_NAME", "lumina")
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
AUTH_SERVICE_URL = os.environ.get("AUTH_SERVICE_URL", "https://demobackend.emergentagent.com")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    session_id: str

class CategoryCreate(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None
    priority: int = 3  # 1=large, 2=medium, 3=small
    icon: Optional[str] = None

class AffirmationCreate(BaseModel):
    text: str
    category_id: str
    duration: int = 240  # seconds (default 4 minutes)
    audio_url: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: str
    image_url: Optional[str]
    priority: int
    icon: Optional[str]
    affirmation_count: int

class AffirmationResponse(BaseModel):
    id: str
    text: str
    category_id: str
    duration: int
    is_favorite: bool = False
    audio_url: Optional[str] = None

# Database connection
client: AsyncIOMotorClient = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    likes_collection = db.likes
    print("DB usada:", DB_NAME)
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token")
    await db.categories.create_index("priority")
    await db.affirmations.create_index("category_id")
    await db.favorites.create_index([("user_id", 1), ("affirmation_id", 1)], unique=True)
    
    # Seed categories and affirmations
    await seed_data()
    
    yield
    
    client.close()

app = FastAPI(title="Lumina - Audio Affirmations API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")

    if not token:
        auth_header = request.headers.get("Authorization", "")
        print("AUTH HEADER:", auth_header)

        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            print("TOKEN EXTRAIDO:", token)

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
           token,
           JWT_SECRET,
           options={
               "verify_signature": False,
               "verify_aud": False
            }
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "user_id": user_id
        }

    except Exception as e:
        print("AUTH ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

async def seed_data():
    """Seed categories and affirmations if they don't exist"""
    
    # Check if categories exist
    existing_categories = await db.categories.count_documents({})
    
    # Seed categories
    categories = [
        {
            "category_id": "cat_morning",
            "name": "Meditaciones para La Mañana",
            "description": "Comienza tu día con energía positiva",
            "priority": 1,
            "icon": "sun",
            "image_url": "morning",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "category_id": "cat_night",
            "name": "Meditaciones para Antes de Dormir",
            "description": "Relájate y prepárate para un sueño reparador",
            "priority": 2,
            "icon": "moon",
            "image_url": "night",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "category_id": "cat_love",
            "name": "Afirmaciones de Amor",
            "description": "Cultiva el amor propio y hacia los demás",
            "priority": 3,
            "icon": "heart",
            "image_url": "love",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "category_id": "cat_abundance",
            "name": "Afirmaciones de Abundancia",
            "description": "Atrae prosperidad y abundancia",
            "priority": 3,
            "icon": "star",
            "image_url": "abundance",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "category_id": "cat_spiritual",
            "name": "Afirmaciones Espirituales",
            "description": "Conecta con tu ser interior",
            "priority": 3,
            "icon": "sparkles",
            "image_url": "spiritual",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "category_id": "cat_confidence",
            "name": "Afirmaciones de Confianza",
            "description": "Fortalece tu autoestima",
            "priority": 3,
            "icon": "flame",
            "image_url": "confidence",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many(categories)

    print("CATEGORIAS INSERTADAS:", len(categories))
    
    # Seed affirmations for each category
    affirmations_data = {
        "cat_morning": [
            "Activa tu día con luz y propósito",
            "Hoy es un nuevo comienzo lleno de posibilidades",
            "Mi energía es positiva y atrae cosas buenas",
            "Estoy agradecido por este nuevo día",
            "Tengo el poder de crear un día maravilloso",
            "La felicidad fluye naturalmente en mi vida",
            "Cada mañana es una oportunidad de crecer",
            "Mi mente está clara y enfocada"
        ],
        "cat_night": [
            "Libero las preocupaciones del día",
            "Mi cuerpo y mente se relajan profundamente",
            "Merezco descansar y recuperar energías",
            "Duermo en paz y armonía",
            "Agradezco todo lo vivido hoy",
            "Mañana será un día aún mejor",
            "Me siento seguro y protegido",
            "Mis sueños son sanadores y reveladores"
        ],
        "cat_love": [
            "El amor fluye libremente hacia mí",
            "Me amo y me acepto completamente",
            "Merezco amor incondicional",
            "Mi corazón está abierto a dar y recibir amor",
            "Las relaciones amorosas enriquecen mi vida",
            "Soy digno de amor y respeto"
        ],
        "cat_abundance": [
            "La abundancia fluye constantemente hacia mí",
            "Merezco prosperidad en todas las áreas",
            "El dinero viene a mí de forma fácil",
            "Estoy abierto a recibir todas las bendiciones",
            "La riqueza es mi estado natural",
            "Atraigo oportunidades de abundancia"
        ],
        "cat_spiritual": [
            "Estoy conectado con mi ser superior",
            "La paz interior guía mis decisiones",
            "Mi espíritu es fuerte y luminoso",
            "Confío en el proceso de la vida",
            "La sabiduría universal me guía",
            "Soy uno con el universo"
        ],
        "cat_confidence": [
            "Confío en mis habilidades y talentos",
            "Soy capaz de lograr mis metas",
            "Mi voz merece ser escuchada",
            "Cada día soy más seguro de mí mismo",
            "Creo en mi potencial ilimitado",
            "Mi confianza crece cada día"
        ]
    }
    
    affirmations_to_insert = []
    for cat_id, texts in affirmations_data.items():
            affirmations_to_insert.append({
                "affirmation_id": "aff_cat_morning_1",
                'title': 'Meditacion para comenzar el dia',
                "text": "Meditacion para comenzar el dia",
                "category_id": cat_id,
                "duration": 240,  # 4 minutes
                "order": 1,
                "audio_url": "https://dahnssobfwceutnshvdj.supabase.co/storage/v1/object/public/Audios/Meditacion%20para%20comenzar%20el%20dia.mp3",
                "created_at": datetime.now(timezone.utc)
            })

            affirmations_to_insert.append({
                "affirmation_id": "aff_cat_morning_2",
                'title': '1 test',
                "text": "1 test",
                "category_id": cat_id,
                "duration": 240,  # 4 minutes
                "order": 2,
                "audio_url": "https://dahnssobfwceutnshvdj.supabase.co/storage/v1/object/public/Audios/1%20test.mp3",
                "created_at": datetime.now(timezone.utc)    
            })

            affirmations_to_insert.append({
                "affirmation_id": "aff_cat_morning_3",
                'title': '2 test',
                "text": "2 test",
                "category_id": cat_id,
                "duration": 240,  # 4 minutes
                "order": 3,
                "audio_url": "https://dahnssobfwceutnshvdj.supabase.co/storage/v1/object/public/Audios/2%20test.mp3",
                "created_at": datetime.now(timezone.utc)    
            })
    
    # await db.affirmations.insert_many(affirmations_to_insert)
    print("Seeded categories and affirmations successfully!")

# Routes
@app.get("/api/health")

async def health_check():
    return {"status": "healthy", "service": "Lumina API"}

@app.post("/api/admin/upload-audio")
async def upload_audio(data: dict):

    affirmation = {
        "affirmation_id": f"aff_{int(datetime.now().timestamp())}",
        "title": data["title"],
        "text": data["title"],
        "category_id": data["category"],
        "duration": 240,
        "order": int(data["order"]),
        "audio_url": data["audio_url"],
        "created_at": datetime.now(timezone.utc)
    }

    await db.affirmations.insert_one(affirmation)

    return {
        "success": True
    }


# Auth Routes
@app.post("/api/auth/register")
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    
    # Check if user exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": user_data.name,
        "password_hash": password_hash,
        "picture": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000,
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": user_data.name,
        "picture": None,
        "access_token": access_token
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin, response: Response):
    email = credentials.email.lower()
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    
    access_token = create_access_token(user["user_id"], email)
    refresh_token = create_refresh_token(user["user_id"])
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000,
        path="/"
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "access_token": access_token
    }

@app.post("/api/auth/google")
async def google_auth(auth_data: GoogleAuthRequest, response: Response):
    """Exchange session_id from Emergent Auth for user data"""
    import requests
    
    try:
        resp = requests.get(
            f"{AUTH_SERVICE_URL}/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": auth_data.session_id},
            timeout=10
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        google_data = resp.json()
        email = google_data["email"].lower()
        
        # Check if user exists
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing:
            user_id = existing["user_id"]
            # Update user info from Google
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": google_data.get("name", existing.get("name")),
                    "picture": google_data.get("picture", existing.get("picture"))
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": google_data.get("name", "Usuario"),
                "picture": google_data.get("picture"),
                "password_hash": None,  # Google users don't have password
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(user_doc)
        
        access_token = create_access_token(user_id, email)
        refresh_token = create_refresh_token(user_id)
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=604800,
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=2592000,
            path="/"
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        user["access_token"] = access_token
        
        return user
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to auth service: {str(e)}")

@app.get("/api/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

# Categories Routes
@app.get("/api/categories")
async def get_categories(request: Request):
    try:
        user = await get_current_user(request)
    except:
        user = None
    
    categories = await db.categories.find({}, {"_id": 0}).sort("priority", 1).to_list(100)
    
    result = []

    for cat in categories:
        count = await db.affirmations.count_documents({"category_id": cat["category_id"]})
        result.append({
            "id": cat["category_id"],
            "name": cat["name"],
            "description": cat["description"],
            "image_url": cat.get("image_url"),
            "priority": cat["priority"],
            "icon": cat.get("icon"),
            "affirmation_count": count
        })

    return result 

@app.get("/api/categories/{category_id}")
async def get_category(
    category_id: str,
    request: Request
):

    try:
        user = await get_current_user(request)
        user_id = user["user_id"]
    except:
        user_id = None

    category = await db.categories.find_one({
        "category_id": category_id
    })

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    category.pop("_id", None)

    affirmations = await db.affirmations.find({
        "category_id": category_id
    }).to_list(100)

    for affirmation in affirmations:

        affirmation.pop("_id", None)

        like = None
        favorite = None

        if user_id:

            like = await db.likes.find_one({
                "user_id": user_id,
                "affirmation_id": affirmation["affirmation_id"]
            })

            favorite = await db.favorites.find_one({
                "user_id": user_id,
                "affirmation_id": affirmation["affirmation_id"]
            })

        affirmation["is_liked"] = like is not None

        affirmation["is_favorite"] = favorite is not None

        affirmation["likes_count"] = await db.likes.count_documents({
            "affirmation_id": affirmation["affirmation_id"]
        })

    return {
        **category,
        "affirmations": affirmations
    }

@app.get("/api/categories/{category_id}/affirmations")
async def get_category_affirmations(category_id: str, request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["user_id"]
    except:
        user_id = None
    
    affirmations = await db.affirmations.find(
        {"category_id": category_id},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    result = []
    for aff in affirmations:
        is_favorite = False
        if user_id:
            fav = await db.favorites.find_one({
                "user_id": user_id,
                "affirmation_id": aff["affirmation_id"]
            })
            is_favorite = fav is not None
        
        result.append({
            "id": aff["affirmation_id"],
            "text": aff["text"],
            "category_id": aff["category_id"],
            "duration": aff["duration"],
            "order": aff.get("order", 1),
            "is_favorite": is_favorite,
            "audio_url": aff.get("audio_url")
            
        })
    
    return result

# Affirmations Routes
@app.get("/api/affirmations/{affirmation_id}")
async def get_affirmation(affirmation_id: str, request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["user_id"]
    except:
        user_id = None
    
    affirmation = await db.affirmations.find_one(
        {"affirmation_id": affirmation_id},
        {"_id": 0}
    )
    
    if not affirmation:
        raise HTTPException(status_code=404, detail="Afirmación no encontrada")
    
    is_favorite = False
    if user_id:
        fav = await db.favorites.find_one({
            "user_id": user_id,
            "affirmation_id": affirmation_id
        })
        is_favorite = fav is not None
    
    return {
        "id": affirmation["affirmation_id"],
        "text": affirmation["text"],
        "category_id": affirmation["category_id"],
        "duration": affirmation["duration"],
        "order": affirmation.get("order", 1),
        "is_favorite": is_favorite
    }

# Favorites Routes
@app.get("/api/favorites")
async def get_favorites(request: Request):
    user = await get_current_user(request)
    
    favorites = await db.favorites.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    affirmation_ids = [f["affirmation_id"] for f in favorites]
    
    affirmations = await db.affirmations.find(
        {"affirmation_id": {"$in": affirmation_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    result = []
    for aff in affirmations:
        result.append({
            "id": aff["affirmation_id"],
            "text": aff["text"],
            "category_id": aff["category_id"],
            "duration": aff["duration"],
            "order": aff.get("order", 1),
            "is_favorite": True
        })
    
    return result

@app.post("/api/favorites/{affirmation_id}")
async def add_favorite(affirmation_id: str, request: Request):
    user = await get_current_user(request)
    
    # Check if affirmation exists
    affirmation = await db.affirmations.find_one({"affirmation_id": affirmation_id})
    if not affirmation:
        raise HTTPException(status_code=404, detail="Afirmación no encontrada")
    
    # Check if already favorite
    existing = await db.favorites.find_one({
        "user_id": user["user_id"],
        "affirmation_id": affirmation_id
    })
    
    if existing:
        return {"message": "Ya está en favoritos", "is_favorite": True}
    
    await db.favorites.insert_one({
        "user_id": user["user_id"],
        "affirmation_id": affirmation_id,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Agregado a favoritos", "is_favorite": True}

@app.delete("/api/favorites/{affirmation_id}")
async def remove_favorite(affirmation_id: str, request: Request):
    user = await get_current_user(request)
    
    result = await db.favorites.delete_one({
        "user_id": user["user_id"],
        "affirmation_id": affirmation_id
    })
    
    if result.deleted_count == 0:
        return {"message": "No estaba en favoritos", "is_favorite": False}
    
    return {"message": "Eliminado de favoritos", "is_favorite": False}

@app.post("/api/affirmations")
async def create_affirmation(data: AffirmationCreate):
    affirmation = data.dict(exclude_none=True)
    affirmation["_id"] = str(ObjectId())
    result = await db.affirmations.insert_one(affirmation)
    return {"id": str(result.inserted_id), **affirmation}

@app.get("/api/admin/audios")
async def get_admin_audios():

    audios = await db.affirmations.find({}).to_list(100)

    for audio in audios:
        audio.pop("_id", None)

    return audios

@app.delete("/api/admin/audio/{affirmation_id}")
async def delete_audio(affirmation_id: str):

    await db.affirmations.delete_one({
        "affirmation_id": affirmation_id
    })

    return {
        "success": True
    }
@app.post("/api/likes/{affirmation_id}")
async def toggle_like(affirmation_id: str, request: Request):

    user = await get_current_user(request)

    affirmation = await db.affirmations.find_one({
        "affirmation_id": affirmation_id
    })

    if not affirmation:
        raise HTTPException(
            status_code=404,
            detail="Afirmación no encontrada"
        )

    existing_like = await db.likes.find_one({
        "user_id": user["user_id"],
        "affirmation_id": affirmation_id
    })

    print("USER:", user["user_id"])
    print("AFFIRMATION:", affirmation_id)
    print("EXISTING LIKE:", existing_like)

    if existing_like:

        await db.likes.delete_one({
            "_id": existing_like["_id"]
        })

        liked = False

    else:
        print("INSERTANDO LIKE")
        
        await db.likes.insert_one({
            "user_id": user["user_id"],
            "affirmation_id": affirmation_id,
            "created_at": datetime.now(timezone.utc)
        })

        liked = True

    likes_count = await db.likes.count_documents({
        "affirmation_id": affirmation_id
    })

    return {
        "liked": liked,
        "likes_count": likes_count
    }


@app.get("/api/likes/{affirmation_id}")
async def get_likes(affirmation_id: str, request: Request):

    user = await get_current_user(request)

    likes_count = await db.likes.count_documents({
        "affirmation_id": affirmation_id
    })

    existing_like = await db.likes.find_one({
        "user_id": user["user_id"],
        "affirmation_id": affirmation_id
    })

    return {
        "likes_count": likes_count,
        "liked": existing_like is not None
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)



import os
import base64
import mysql.connector
import time
import vertexai
from vertexai.generative_models import GenerativeModel,GenerationConfig,GenerativeModel, Part, SafetySetting, FinishReason

# Setup Google Cloud credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/var/www/api.pratyushh.online/Google.json'

# Database connection setup
db = mysql.connector.connect(
    host="localhost",
    user="pratyush",
    password="pratyush151",
    database="school"
)

# Function to check for pending images in the database
def check_pending_images():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM processing_data WHERE status = 'pending'")
    pending_images = cursor.fetchall()
    cursor.close()
    return pending_images

# Function to update the database with processed data
def update_image_status(id, json_data, status='completed'):
    cursor = db.cursor()
    cursor.execute("UPDATE processing_data SET jsondata = %s, status = %s WHERE id = %s", (json_data, status, id))
    db.commit()
    cursor.close()

# Google Vertex AI Setup for generating content
def initialize_vertex_ai():
    vertexai.init(project="focal-woods-435405-d2", location="us-central1")
    model = GenerativeModel("gemini-1.5-pro-001")
    return model

# Function to generate content using Google Vertex AI
def generate_content(image_path, model):
    # Read image and convert to base64
    with open(image_path, 'rb') as image_file:
        base64_encoded_image = base64.b64encode(image_file.read())
    
    base64_string = base64_encoded_image.decode('utf-8')

    image_part = Part.from_data(
        mime_type="image/jpeg",
        data=base64.b64decode(base64_string)
    )
    
    response_schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "Date of Application": {"type": "STRING"},
                "Name in English": {"type": "STRING"},
                "Name in Hindi": {"type": "STRING"},
                "Father's Name in English": {"type": "STRING"},
                "Father's Name in Hindi": {"type": "STRING"},
                "Mother's Name in English": {"type": "STRING"},
                "Mother's Name in Hindi": {"type": "STRING"},
                "Parents Address in English": {"type": "STRING"},
                "Parents Address in Hindi": {"type": "STRING"},
                "Pincode": {"type": "INTEGER"},
                "Scholar's date of birth": {"type": "STRING"},
                "Mobile No": {"type": "INTEGER"},
                "Aadhar no": {"type": "INTEGER"},
                "Gender": {"type": "STRING", "enum": ["Male", "Female", "Transgender"]},
                "Category / Caste": {"type": "STRING", "enum": ["General", "SC", "ST", "OBC"]},
                "Minority Group": {"type": "STRING", "enum": ["N/A", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"]},
                "Class to which admission is sought": {"type": "String", "enum": ['6', '7', '8', '9', '10']},
                "Father's Occupation": {"type": "STRING"},
                "Name, Address of the local guardian": {"type": "STRING"},
                "Duration of Stay of the Scholar in State": {"type": "STRING"},
                "Religion": {"type": "STRING"}
            }
        }
    }

    safety_settings = [
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
    ]

    responses = model.generate_content(
        [image_part, "extract table and translate as required"],
        generation_config=GenerationConfig(response_mime_type="application/json", response_schema=response_schema, max_output_tokens=2000, temperature=1.5, top_p=0.95),
        safety_settings=safety_settings,
        stream=True,
    )

    content = ""
    for response in responses:
        content += response.text

    return content

# Main function to process pending images
def process_pending_images():
    model = initialize_vertex_ai()
    while True:
        pending_images = check_pending_images()
        for image in pending_images:
            print(f"Processing image: {image['image_name']} (ID: {image['id']})")
            image_path = f"/var/www/api.pratyushh.online/Student_entrance_form/{image['image_name']}"
            
            try:
                json_data = generate_content(image_path, model)
                update_image_status(image['id'], json_data)
                print(f"Image {image['image_name']} processed successfully.")
            except Exception as e:
                print(f"Error processing image {image['image_name']}: {str(e)}")
        
        time.sleep(10)  # Check for new pending images every minute

# Start processing pending images
if __name__ == "__main__":
    process_pending_images()

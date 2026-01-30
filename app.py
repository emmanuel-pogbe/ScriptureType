import sys
import os
import uuid
import secrets
sys.path.insert(0, 'modules')
from flask import Flask
from flask import render_template,make_response,jsonify,request
import modules.bible as bible
import modules.alias_map as aliasmap
import modules.prefix_map as prefixmap
import db
scripture_data = bible.__bibleverses
bible_books = bible.__biblebooks
prefix_map = prefixmap.__bible_prefix_map
alias_map = aliasmap.__bible_alias_map
app = Flask(__name__,template_folder="templates",static_folder="static")
@app.route("/")
def index():
    return render_template("index.html",scripture_data=scripture_data,bible_books=bible_books,prefix_map=prefix_map,alias_map=alias_map)

@app.route("/leaderboards",methods=["GET","POST"])
def get_leaderboard():

    top_10 = db.get_top_10("10") #[(name,country_code,score,software used, country name),...]
    if request.method == "POST":
        data = request.get_json()
        player_id = data.get("id")
        player_position_info = db.get_player_position_info("10", player_id)
        if player_position_info:
            return render_template("leaderboard.html",top_10 = top_10,player_position_info = player_position_info)
    return render_template("leaderboard.html",top_10 = top_10)  

@app.route("/register",methods=["POST"])
def register_player():
    #Register a player in the Database when the player gets a highscore - first checks if player is registered
    player_id = str(uuid.uuid4())
    secret_token = secrets.token_hex(32)
    data = request.get_json()
    name = data.get("name")
    country = data.get("country")
    score = data.get("score")
    software = data.get("software")   
    selected_test = data.get("selectedTest")
    timestamp = data.get("timestamp") 

    #We could save the data to the DB now

    response = make_response(jsonify({
        "player_id":player_id,
        "message":"Player registered successfully"
    }))
    response.set_cookie(
        'auth_token',
        value=secret_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=31536000 #Valid for 1 year (in seconds)
    )
    return response
@app.route('/sync-identity')
def sync_identity():
    # 1. Get the hidden secret_token from the HttpOnly cookie
    auth_token = request.cookies.get('auth_token')
    
    if not auth_token:
        return jsonify({"error": "No session found"}), 401

    # 2. Look up the REAL player_id in your database using that token
    player = db.get_player_info() #Doesn't exist yet

    if player:
        # 3. Send the correct ID back so the frontend can fix its localStorage
        return jsonify({"player_id": player['id']})
    
    return jsonify({"error": "Invalid token"}), 403
if __name__=="__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run("0.0.0.0",port=port,debug=True)
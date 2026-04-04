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
import helpers
scripture_data = bible.__bibleverses
bible_books = bible.__biblebooks
prefix_map = prefixmap.__bible_prefix_map
alias_map = aliasmap.__bible_alias_map
app = Flask(__name__,template_folder="templates",static_folder="static")
db.init_db()
@app.route("/")
def index():
    country_list = helpers.get_country_list()
    return render_template("index.html",scripture_data=scripture_data,bible_books=bible_books,prefix_map=prefix_map,alias_map=alias_map,country_list=country_list)

@app.route("/leaderboards",methods=["GET","POST"])
def get_leaderboard():
    test_type = request.args.get("type",default="Scriptures 10",type=str)
    valid = ["Scriptures 10","Scriptures 20","Time 30","Time 60"]
    if test_type not in valid:
        test_type = "Scriptures 10"

    auth_token = request.cookies.get('auth_token')
    player_id = None

    if auth_token:
        player_data = db.get_player_info(auth_token)
        if player_data:
            player_id = player_data[0]

    def get_leaderboard_slice(current_test_type, current_player_id):
        top_10_data = db.get_top_10(current_test_type)
        player_position = None
        if current_player_id:
            player_position = db.get_player_position_info(current_test_type, current_player_id)
        return {
            "top_10": top_10_data,
            "player_position_info": player_position
        }

    if request.method == "POST":
        data = request.get_json() or {}
        player_id = data.get("id") or player_id
        leaderboard_slice = get_leaderboard_slice(test_type, player_id)
        return render_template("leaderboard_partial.html",top_10 = leaderboard_slice["top_10"],player_position_info = leaderboard_slice["player_position_info"])

    if request.args.get("partial"):
        leaderboard_slice = get_leaderboard_slice(test_type, player_id)
        return render_template("leaderboard_partial.html",top_10 = leaderboard_slice["top_10"],player_position_info = leaderboard_slice["player_position_info"])

    leaderboard_cache = {
        current_test_type: get_leaderboard_slice(current_test_type, player_id)
        for current_test_type in valid
    }

    if request.headers.get("Accept") == "application/json":
        return jsonify({
            "selected_test_type": test_type,
            "leaderboards": leaderboard_cache
        })
    selected_slice = leaderboard_cache.get(test_type, {"top_10": [], "player_position_info": None})
    return render_template(
        "leaderboard.html",
        top_10=selected_slice.get("top_10"),
        player_position_info=selected_slice.get("player_position_info"),
        leaderboard_cache=leaderboard_cache,
        selected_test_type=test_type
    )

@app.route("/get_specific_leaderboard",methods=["POST"])
def get_specific_leaderboard():
    data = request.get_json()
    test_type = data.get("test_type")
    top_10 = db.get_top_10(test_type)
    return jsonify(top_10)

@app.route("/register",methods=["POST"])
def register_player():
    player_id = str(uuid.uuid4())
    secret_token = secrets.token_hex(32)
    data = request.get_json()
    name = data.get("name")
    country = data.get("country")
    score = data.get("score")
    software = data.get("software")   
    selected_test = data.get("selectedTest")
    timestamp = data.get("timestamp") 

    registration_status = db.register_player(player_id,secret_token,name,country,score,software,selected_test,timestamp)
    if registration_status == "Player already registered":
        return jsonify({
            "player_id":None,
            "message":"Player already registered"
        })
    if registration_status == 1: #If registration is successful
        response = make_response(jsonify({
            "player_id":player_id,
            "message":"Player registered successfully"
        }))
        response.set_cookie(
            'auth_token',
            value=secret_token,
            httponly=True,
            samesite='Lax',
            max_age=31536000 #Valid for 1 year (in seconds)
        )
        return response
    return jsonify({
        "player_id":None,
        "message":"Player registration failed"
    })

@app.route("/update-score", methods=["POST"])
def update_score():
    data = request.get_json()
    new_score = data.get("new_score")
    user_id = data.get("user_id")
    test_type = data.get("selectedTest")
    software = data.get("software")
    timestamp = data.get("timestamp")
    try:
        db.update_user_score(user_id, test_type, software, timestamp, new_score)
        return jsonify({"message": "Score updated successfully"})
    except Exception as e:
        print("Something went wrong " + str(e))
        return jsonify({"message": f"{str(e)} ----> Score update failed"})

@app.route('/sync-identity')
def sync_identity():
    # 1. Get the hidden secret_token from the HttpOnly cookie
    auth_token = request.cookies.get('auth_token')
    if not auth_token:
        return jsonify({"error": "No session found"}), 401

    # 2. Look up the REAL player_id in your database using that token
    player = db.get_player_info(auth_token)

    if player:
        # 3. Send the correct ID back so the frontend can fix its localStorage
        return jsonify({"player_id": player['id']})
    return jsonify({"error": "Invalid token"}), 403
if __name__=="__main__":
    flask_port = int(os.environ.get("FLASK_PORT", 5000))
    app.run("0.0.0.0",port=flask_port,debug=True)
import io
from io import BytesIO
import os
from flask import Flask, jsonify, request, send_file
from PIL import Image
import subprocess
import base64
from flask_cors import CORS, cross_origin

app = Flask("Mwah Mwah")
CORS(app, origins='*')

@app.route('/', methods=['POST'])
def errmm():
    return 'qqqq'

@app.route('/spin', methods=['POST'])
def wopper():
    # Get the base64-encoded image from the request body
    data = request.get_json()
    # assuming the image is under the key 'image'
    image_data = data.get('image')

    if image_data:
        # Strip off the data URI prefix if it exists (e.g., "data:image/jpeg;base64,")
        if image_data.startswith('data:image'):
            header, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        # Decode the base64 image string
        image_bytes = base64.b64decode(encoded)

        # Optionally save the image or process it (using PIL here as an example)
        image = Image.open(BytesIO(image_bytes))
        image.save('drawing.png')  # Save the image to the server

    command = ['./venv/bin/python3.12', 'src/pose.py',
               '--save-path', 'testing/out',
               '--img-path',  './drawing.png',
               '--use-natural',
               '--use-cos',
               '--use-angle-transf']

    process = subprocess.Popen(command)
    hehe = process.wait()

    return send_file('./testing/out/drawing/spin.ply', as_attachment=True, download_name='model.ply', mimetype='application/octet-stream')


@app.route('/eft', methods=['POST'])
def wopper2():
    # Get the base64-encoded image from the request body
    data = request.get_json()
    # assuming the image is under the key 'image'
    image_data = data.get('image')

    if image_data:
        # Strip off the data URI prefix if it exists (e.g., "data:image/jpeg;base64,")
        if image_data.startswith('data:image'):
            header, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        # Decode the base64 image string
        image_bytes = base64.b64decode(encoded)

        # Optionally save the image or process it (using PIL here as an example)
        image = Image.open(BytesIO(image_bytes))
        image.save('drawing.png')  # Save the image to the server

    command = ['./venv/bin/python3.12', 'src/pose_eft.py',
               '--save-path', 'testing/out',
               '--img-path',  './drawing.png',
               '--use-natural',
               '--use-cos',
               '--use-angle-transf']

    process = subprocess.Popen(command)
    hehe = process.wait()

    return send_file('./testing/out/drawing/eft.ply', as_attachment=True, download_name='model.ply', mimetype='application/octet-stream')


@app.route('/dc', methods=['POST'])
def wopper3():
    # Get the base64-encoded image from the request body
    data = request.get_json()
    # assuming the image is under the key 'image'
    image_data = data.get('image')

    if image_data:
        # Strip off the data URI prefix if it exists (e.g., "data:image/jpeg;base64,")
        if image_data.startswith('data:image'):
            header, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        # Decode the base64 image string
        image_bytes = base64.b64decode(encoded)

        # Optionally save the image or process it (using PIL here as an example)
        image = Image.open(BytesIO(image_bytes))
        image.save('drawing.png')  # Save the image to the server

    command = ['./venv/bin/python3.12', 'src/pose_dc.py',
               '--save-path', 'testing/out',
               '--img-path',  './drawing.png',
               '--use-contacts',
               '--use-natural',
               '--use-cos',
               '--use-angle-transf']

    process = subprocess.Popen(command)
    hehe = process.wait()

    return send_file('./testing/out/drawing/dc.ply', as_attachment=True, download_name='model.ply', mimetype='application/octet-stream')


@app.route('/us', methods=['POST'])
def wopper4():
    # Get the base64-encoded image from the request body
    data = request.get_json()
    # assuming the image is under the key 'image'
    image_data = data.get('image')

    if image_data:
        # Strip off the data URI prefix if it exists (e.g., "data:image/jpeg;base64,")
        if image_data.startswith('data:image'):
            header, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        # Decode the base64 image string
        image_bytes = base64.b64decode(encoded)

        # Optionally save the image or process it (using PIL here as an example)
        image = Image.open(BytesIO(image_bytes))
        image.save('drawing.png')  # Save the image to the server

    command = ['./venv/bin/python3.12', 'src/pose_us.py',
               '--save-path', 'testing/out',
               '--img-path',  './drawing.png',
               '--use-contacts',
               '--use-natural',
               '--use-cos',
               '--use-angle-transf']

    process = subprocess.Popen(command)
    hehe = process.wait()

    return send_file('./testing/out/drawing/us.ply', as_attachment=True, download_name='model.ply', mimetype='application/octet-stream')


@app.route('/skeleton', methods=['POST'])
def send_image():
    # Get JSON data from the request
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "Filename not provided"}), 400

    filename = data['filename']
    filepath = os.path.join('testing/out/drawing', filename + '_2dkps.png')

    return send_file(filepath, mimetype='image/jpeg')


app.run(debug=True)

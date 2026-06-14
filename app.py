"""
BraillePlay - Plataforma Educacional para Aprendizagem de Braille
"""

import hashlib
import os
import random
from flask import Flask, jsonify, render_template, request, send_file

app = Flask(__name__)

# Pasta onde os áudios gerados pelo gTTS ficam em cache
AUDIO_DIR = os.path.join(app.root_path, 'static', 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# Quantidade máxima de áudios mantidos em cache (os mais antigos são removidos)
MAX_AUDIO_CACHE = 60

# Caractere Unicode Braille base (célula vazia). Cada ponto ativo soma um bit:
# ponto 1 = 0x01, ponto 2 = 0x02, ponto 3 = 0x04,
# ponto 4 = 0x08, ponto 5 = 0x10, ponto 6 = 0x20
BRAILLE_BASE = 0x2800

BRAILLE = {
    'A': [1],         'B': [1, 2],       'C': [1, 4],       'D': [1, 4, 5],
    'E': [1, 5],      'F': [1, 2, 4],    'G': [1, 2, 4, 5], 'H': [1, 2, 5],
    'I': [2, 4],      'J': [2, 4, 5],    'K': [1, 3],       'L': [1, 2, 3],
    'M': [1, 3, 4],   'N': [1, 3, 4, 5], 'O': [1, 3, 5],    'P': [1, 2, 3, 4],
    'Q': [1, 2, 3, 4, 5], 'R': [1, 2, 3, 5], 'S': [2, 3, 4], 'T': [2, 3, 4, 5],
    'U': [1, 3, 6],   'V': [1, 2, 3, 6], 'W': [2, 4, 5, 6], 'X': [1, 3, 4, 6],
    'Y': [1, 3, 4, 5, 6], 'Z': [1, 3, 5, 6],
}


def pontos_para_unicode(pontos):
    """Converte uma lista de pontos ativos (1-6) no caractere Braille Unicode."""
    code = BRAILLE_BASE
    for p in pontos:
        code |= 1 << (p - 1)
    return chr(code)


def texto_para_braille(texto):
    """Converte um texto em uma lista de células Braille (letra, pontos, unicode)."""
    resultado = []
    for ch in texto.upper():
        if ch == ' ':
            resultado.append({'letra': ' ', 'pontos': [], 'unicode': chr(BRAILLE_BASE)})
        elif ch in BRAILLE:
            pontos = BRAILLE[ch]
            resultado.append({'letra': ch, 'pontos': pontos, 'unicode': pontos_para_unicode(pontos)})
        else:
            # Caractere não suportado (acentos, números, pontuação)
            resultado.append({'letra': ch, 'pontos': None, 'unicode': None})
    return resultado


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/aprender')
def aprender():
    return render_template('aprender.html', braille=BRAILLE)


@app.route('/forca')
def forca():
    return render_template('forca.html')


@app.route('/conversor')
def conversor():
    return render_template('conversor.html')


@app.route('/api/braille')
def api_braille():
    return jsonify(BRAILLE)


@app.route('/api/letra-aleatoria')
def letra_aleatoria():
    letra = random.choice(list(BRAILLE.keys()))
    return jsonify({'letra': letra, 'pontos': BRAILLE[letra]})


@app.route('/api/converter')
def api_converter():
    texto = request.args.get('texto', '')
    if len(texto) > 200:
        texto = texto[:200]
    return jsonify(texto_para_braille(texto))


def _limpar_cache_audio():
    """Mantém a pasta de áudio com no máximo MAX_AUDIO_CACHE arquivos
    (remove os usados há mais tempo, estilo LRU)."""
    arquivos = [os.path.join(AUDIO_DIR, f) for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3')]
    if len(arquivos) <= MAX_AUDIO_CACHE:
        return
    arquivos.sort(key=os.path.getmtime)
    for caminho in arquivos[:-MAX_AUDIO_CACHE]:
        os.remove(caminho)


@app.route('/api/tts')
def api_tts():
    """Gera (com cache) e devolve um áudio MP3 a partir de um texto, usando edge-tts."""
    texto = request.args.get('texto', '').strip()
    if not texto:
        return jsonify({'erro': 'texto vazio'}), 400
    if len(texto) > 300:
        texto = texto[:300]

    nome_arquivo = hashlib.md5(texto.encode('utf-8')).hexdigest() + '.mp3'
    caminho = os.path.join(AUDIO_DIR, nome_arquivo)

    if os.path.exists(caminho):
        os.utime(caminho, None)  # marca como usado recentemente (LRU)
    else:
        try:
            import asyncio
            import edge_tts
            comunicador = edge_tts.Communicate(texto, voice='pt-BR-FranciscaNeural')
            asyncio.run(comunicador.save(caminho))
            _limpar_cache_audio()
        except Exception as e:
            return jsonify({'erro': str(e)}), 502

    return send_file(caminho, mimetype='audio/mpeg')


if __name__ == '__main__':
    print("🟣 BraillePlay em http://localhost:5000")
    app.run(debug=True, port=5000)
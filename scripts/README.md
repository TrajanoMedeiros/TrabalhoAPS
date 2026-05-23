# Scripts

Scripts auxiliares que nao fazem parte do runtime principal do monorepo.

## Chatbot Terminal

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/chatbot.py
```

`GEMINI_API_KEY` e opcional. Sem a chave, o chatbot usa respostas locais deterministicas.

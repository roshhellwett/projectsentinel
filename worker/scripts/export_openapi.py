"""Export the FastAPI OpenAPI schema to a JSON file."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app

schema = app.openapi()
output = Path(__file__).resolve().parent.parent / "openapi.json"
output.write_text(json.dumps(schema, indent=2))
print(f"OpenAPI schema written to {output}")

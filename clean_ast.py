import ast
import glob

def strip_comments_and_docstrings(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse to AST
        tree = ast.parse(content)

        # Remove docstrings
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef, ast.Module)):
                if (node.body and isinstance(node.body[0], ast.Expr) and 
                    isinstance(node.body[0].value, ast.Constant) and 
                    isinstance(node.body[0].value.value, str)):
                    node.body.pop(0)

        # Unparse back to source code (this guarantees all '#' comments are removed permanently)
        cleaned_code = ast.unparse(tree)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned_code)
    except Exception as e:
        print(f"Skipping {filepath} due to error: {e}")

for ext in ['backend/**/*.py', 'ml/**/*.py']:
    for filepath in glob.glob(ext, recursive=True):
        if 'node_modules' in filepath or '.venv' in filepath or '__pycache__' in filepath:
            continue
        strip_comments_and_docstrings(filepath)

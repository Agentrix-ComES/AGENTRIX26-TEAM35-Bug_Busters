import sys

from agents.supervisor_agent import supervisor_agent


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

while True:
    try:
        query = input("\nAsk: ").strip()
    except EOFError:
        break

    if query.lower() in ["exit", "quit"]:
        break
    if not query:
        continue

    result = supervisor_agent(query)

    print("\nRESULT:\n", result)

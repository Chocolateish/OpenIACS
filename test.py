from llama_cpp import Llama

llm = Llama(model_path="models/your-model.gguf")
output = llm("Hello, world!")
print(output)

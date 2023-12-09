import json

# Load the JSON file
with open('nodelist.json', 'r') as file:
    data = json.load(file)

# Add "stop": "" to each node
for node in data['nodes']:
    node['stop'] = ""

# Save the modified data back to the file
with open('nodelist.json', 'w') as file:
    json.dump(data, file, indent=2)

print("Modification completed.")

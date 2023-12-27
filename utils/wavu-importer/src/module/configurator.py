import os, json

class Configurator:
    def __init__(self, config_path):
        self.config_path = config_path

    def create_file_if_not_exist(self):
        if not os.path.exists(self.config_path):
            with open(self.config_path, "w"): pass

    def read_config(self) -> dict:
        self.create_file_if_not_exist()
        with open(self.config_path) as config_json:
            config_data = json.load(config_json)

        return config_data

    def write_config(self, config_json):
        self.create_file_if_not_exist()
        with open(self.config_path, "w") as outfile:
            json.dump(config_json, outfile, indent=4)


from setuptools import setup, find_packages

setup(
    name="jarvis-backend",
    version="1.0.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        line.strip() for line in open("requirements.txt").readlines()
    ],
)
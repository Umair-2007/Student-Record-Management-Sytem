#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Student Record Management System - SSL Setup${NC}\n"

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "OpenSSL is not installed. Please install it first."
    exit 1
fi

# Check if certificates already exist
if [ -f "cert.pem" ] && [ -f "key.pem" ]; then
    echo -e "${YELLOW}SSL certificates already exist.${NC}"
    read -p "Do you want to regenerate them? (y/n): " regenerate
    if [[ $regenerate != "y" && $regenerate != "Y" ]]; then
        echo "Keeping existing certificates."
        exit 0
    fi
fi

echo -e "\n${YELLOW}Generating self-signed SSL certificates...${NC}"

# Generate self-signed certificates
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}SSL certificates generated successfully!${NC}"
    echo -e "cert.pem and key.pem files have been created."
    echo -e "\n${YELLOW}Note:${NC} Since these are self-signed certificates, browsers will show a security warning."
    echo "This is normal for development environments."
    
    # Make key.pem readable only by the owner
    chmod 600 key.pem
    echo "Private key permissions set to owner-only."
    
    echo -e "\n${GREEN}You can now run the server with HTTPS support using:${NC}"
    echo "./run_server.sh"
    
    exit 0
else
    echo -e "\n${RED}Failed to generate SSL certificates.${NC}"
    exit 1
fi
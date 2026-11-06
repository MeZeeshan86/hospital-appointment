pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Verify source files') {
            steps {
                bat 'if not exist index.html exit 1'
                bat 'if not exist styles.css exit 1'
                bat 'if not exist app.js exit 1'
                bat 'if not exist Dockerfile exit 1'
            }
        }
        stage('Build Docker image') {
            steps { bat 'docker build -t carepoint-hospital:latest .' }
        }
        stage('Deploy container') {
            steps {
                bat 'docker rm -f carepoint-hospital-container 2>NUL || exit /b 0'
                bat 'docker run -d -p 8080:80 --name carepoint-hospital-container carepoint-hospital:latest'
            }
        }
        stage('Install Selenium dependencies') {
            steps { bat 'npm install' }
        }
        stage('Run Selenium UI tests') {
            steps { bat 'npm test' }
        }
    }
    post {
        success { echo 'CarePoint image built and container started.' }
        failure { echo 'Pipeline failed. Check the stage console output.' }
    }
}

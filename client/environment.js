appSettings = {
  // @if ENV == 'DEVELOPMENT'
  hostUrl: 'http://localhost:3000',
  apiVersion: 'v1',
  debug: true
  // @endif
  
  // @if ENV == 'STAGE'
  hostUrl: 'https://test.api-example.com/',
  apiVersion: 'v1'
  // @endif
   
  // @if ENV == 'PRODUCTION'
  hostUrl: 'https://api-example.com/',
  apiVersion: 'v1'
  // @endif
}
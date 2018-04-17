# Architectural decisions

## 17-04-18

- Removed webpack from serverless: using webpack with this project is not 100% trivial, as we need to
bundle the ffmpeg binary (src/bin/ffmpeg_linux64). The import of this binary is also dynamic (_require_ 
takes a variable as path) which makes the webpack setup also more complex.

Webpack should be added again if there is time to implement. Starting point: https://github.com/serverless-heaven/serverless-webpack/issues/242

- Took ffmpeg binaries in the repo: There is a node module `ffmpeg-static` which can be used to get the
ffmpeg binaries. As the webpack setup was not fine with this module, it got removed.

`ffmpeg-static` should be added again if there is time to implement
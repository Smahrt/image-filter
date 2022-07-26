import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, checkValidToken, generateToken } from './util/util';

(async () => {
  // get env vars
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.post('/auth', async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // generate a token
      const token = await generateToken(username);
      res.status(200).json({ token });
    } else {
      res.status(401).json('Wrong username or password');
    }
  });

  app.get('/filteredimage',
    async (req, res, next) => {
      // check valid token
      const bearerToken = req.headers.authorization;

      if (!bearerToken) {
        return res.status(422).json('Missing authorization token. Please login.');
      }

      // get token from header
      const token = bearerToken.split(' ')[1];

      const isValidToken = await checkValidToken(token);
      if (!isValidToken) {
        return res.status(403).json('You don\'t have permission to access this resource');
      }
      next();
    },
    async (req, res) => {
      const { image_url = '' } = req.query as { image_url?: string; };
      if (image_url === '' || (!image_url.endsWith('.png') && !image_url.endsWith('.jpg'))) {
        return res.status(422).send('Image url is required and must be a jpg or png but got ' + image_url);
      }

      try {
        const filteredpath = await filterImageFromURL(image_url);
        res.sendFile(filteredpath);

        // delete the localfiles after 1 min
        setTimeout(() => {
          deleteLocalFiles([filteredpath]);
        }, 60000);
      } catch (error) {
        res.status(500).send('Error while filtering image');
      }
    });

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  // Error handling
  app.use(((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
  }) as ErrorRequestHandler);


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
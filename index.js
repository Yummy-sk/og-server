import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import xpath from 'xpath';
import cors from 'cors';
import { DOMParser } from 'xmldom';

const app = express();

let corsOptions = {
  origin: 'http://localhost:3000/',
  credentials: true,
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.post('/', (req, res) => {
  const { body } = req;
  const { url } = body;

  parseUrl(url).then(result => res.json(result));
});

app.listen(8080, () => console.log('Server started'));

const xpaths = {
  title: 'string(//meta[@property="og:title"]/@content)',
  description: 'string(//meta[@property="og:description"]/@content)',
  image: 'string(//meta[@property="og:image"]/@content)',
  keywords: 'string(//meta[@property="og:keywords"]/@content)',
  url: 'string(//meta[@property="og:url"]/@content)',
};

const retrievePage = url => axios.request({ url });
const convertBodyToDocument = body => new DOMParser().parseFromString(body);
const nodeFromDocument = (document, xpathselector) => xpath.select(xpathselector, document);
const mapProperties = (paths, document) =>
  Object.keys(paths).reduce((acc, key) => ({ ...acc, [key]: nodeFromDocument(document, paths[key]) }), {});
const parseUrl = url =>
  retrievePage(url).then(response => {
    const document = convertBodyToDocument(response.data);
    const mappedProperties = mapProperties(xpaths, document);
    return mappedProperties;
  });

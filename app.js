import express from "express";
import fs from "fs/promises";
import path from "path";
import markdownIt  from "markdown-it";
import fm from "front-matter";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fileURLToPath } from "url";

//Devuelve la carpeta del directorio
const __filename = fileURLToPath(new URL(import.meta.url)); // Obtengo la ruta completa hasta el archivo principal app.js
const __dirname = path.dirname(__filename); // Usa path.dirname para obtener el directorio de ese archivo


const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "pages"));  
app.set("view engine", "pug");

//Rutas dinamicas desde archivos en la carpeta "pages"
const pagesDir = path.join(__dirname, "pages");
const files = await fs.readdir(pagesDir);

// Aquí lógica para archivos html y md
for (let file of files) {
  const filePath = path.join(pagesDir, file);
  let extname = path.extname(file);

  console.log(file, filePath, extname);

  if (extname === ".md" || extname === ".pug" || extname === ".html") {
    let fileName = path.basename(file, extname);
    console.log(fileName);

    app.get(`/${fileName}`, async (req, res) => {
      try {
        if (extname === ".pug") {
          res.render(fileName);
        }

        if (extname === ".html") {
          res.sendFile(filePath);
        }

        if (extname === ".md") {
          let fileContent = await fs.readFile(filePath, "utf-8");
          let { attributes: frontMatterAttributes, body } = fm(fileContent);

          let attributes = frontMatterAttributes;
          let contentHTML = markdownIt().render(body);
          res.render("_Layout_md", { ...attributes, contentHTML });
        }
      } catch (err) {
        res.status(404).render("error_404");
      }
    });
  }
}

//Ruta de la página principal
app.get("/", (req, res) => {
  res.render("index");
});

//Ruta del error 404
app.use((req, res) => {
  res.status(404).render("error_404");
});


app.listen(port, () => console.log(`Sitio corriendo en el puerto: http://localhost:${port}`));
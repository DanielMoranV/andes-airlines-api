import app from "./app";
const main = () => {
  //Iniciando el servidor, escuchando...
  app.listen(app.get("port"), () => {
    console.log(`Server init at http://localhost:${app.get("port")} `);
  });
};

main();

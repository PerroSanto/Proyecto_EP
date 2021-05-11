**Configuracion Postman**

Body, raw, JSON


**carreras**

     GET http://localhost:3001/car/

     #findOne     
     GET http://localhost:3001/car/1


     POST http://localhost:3001/car/

     {"nombre": "Informatica"}

     PUT http://localhost:3001/car/1

     {"nombre": "Psicologia"}

     DELETE http://localhost:3001/car/1


**materias**

     GET http://localhost:3001/mat/


     POST http://localhost:3001/mat/

     {"nombre": "EIS","id_carrera":"1"}

     #findOne     
     GET http://localhost:3001/mat/1

     PUT http://localhost:3001/mat/1
     
     {"nombre": "Programacion"}
     {"id_carrera": "1"}

     DELETE http://localhost:3001/mat/1
#BASE DE DATOS
-La base de datos se llama modulopagos, ejecutar el .sql para instalar dicha base de datos
-En la base de datos, el campo balance_restante es calculado, no insertado directamente.
-El estado de la factura es calculado según los pagos que tenga, por default está como Pendiente.

#Proyecto next.js
-Debe instalar un .env y adjuntar la url completa de la base de datos en una variable llamada DATABASE_URL
-ejecutar npm install
-ejecutar npx prisma generate
-una vez ejecutado el proyecto, puedes acceder al link /invoices para ver la tabla de balances y al link /payments para ver la tabla de pagos

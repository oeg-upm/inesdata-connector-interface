#!/bin/sh

# REQUIRED ENV VARS
#
# - $JWT_WHITELISTED_DOMAINS
# - $API_BASEURL_AUTH
# - $API_BASEURL_TASKS
# - $API_BASEURL_USERS
#

# Remplaza los valores de configuracion en entorno con variables de entorno
if test -f "$ENVIRONMENT_CFG_TPL"; then
    echo "Creando fichero de configuracion desde plantilla con variables de entorno"
    envsubst < $ENVIRONMENT_CFG_TPL > $ENVIRONMENT_CFG_TMP && cp $ENVIRONMENT_CFG_TMP $ENVIRONMENT_CFG && cat $ENVIRONMENT_CFG
    echo "Fichero de configuracion de entorno creado"
else
    echo "No existe fichero plantilla de configuracion en $ENVIRONMENT_CFG_TPL"
fi

echo "Iniciando servidor web nginx"
# Execute nginx with same parameters defined in nginx:stable official dockerfile
nginx -g 'daemon off;'

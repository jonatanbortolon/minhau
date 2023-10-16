FROM postgres:15

RUN apt-get update
RUN apt-get install -y wget autoconf libtool libpq-dev libxml2-dev libgeos-dev libproj-dev protobuf-c-compiler libjsoncpp-dev libprotobuf-dev libprotobuf-c-dev libgdal-dev g++ make postgresql-server-dev-15
RUN rm -rf /var/lib/apt/lists/*
RUN wget https://postgis.net/stuff/postgis-3.3.2.tar.gz
RUN tar -xvzf postgis-3.3.2.tar.gz

WORKDIR /postgis-3.3.2
RUN sh autogen.sh
RUN ./configure

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen

RUN make
RUN make install
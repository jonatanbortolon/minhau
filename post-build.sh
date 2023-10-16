#!/bin/bash

npx prisma generate

npx prisma db push

echo '[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"'"$TWA_PACKAGE_NAME"'","sha256_cert_fingerprints":["'"$TWA_SHA256_CERTIFICATE"'"]}}]' >> ./public/.well-known/assetlinks.json
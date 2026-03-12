/**
 * Nix OCI image for the Career Bridge frontend (nginx serving Vite build).
 *
 * Build:
 *   nix build .#frontend-image
 *   docker load < result
 *   docker push us-docker.pkg.dev/<project>/career-bridge/frontend:<tag>
 *
 * Produces a minimal nginx image serving the compiled SPA.
 * API calls are proxied to the backend service via nginx config.
 */
{ pkgs, ... }:

let
  # Build the frontend with Vite
  # In practice, run `npm run build` in CI and copy the dist/ folder.
  # This nix expression documents the intent; actual build is in CI pipeline.

  nginxConfig = pkgs.writeText "nginx.conf" ''
    worker_processes auto;
    error_log /dev/stderr warn;
    pid /tmp/nginx.pid;

    events {
      worker_connections 1024;
    }

    http {
      include       ${pkgs.nginx}/conf/mime.types;
      default_type  application/octet-stream;
      access_log    /dev/stdout;
      sendfile      on;
      gzip          on;
      gzip_types    text/plain text/css application/json application/javascript text/xml application/xml;

      server {
        listen       8080;
        root         /app/dist;
        index        index.html;

        # Proxy API calls to the backend service
        location /api/ {
          proxy_pass         http://career-bridge-backend:8000/api/;
          proxy_set_header   Host $host;
          proxy_set_header   X-Real-IP $remote_addr;
          proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # SPA fallback — serve index.html for all non-asset routes
        location / {
          try_files $uri $uri/ /index.html;
        }
      }
    }
  '';

in
pkgs.dockerTools.buildLayeredImage {
  name = "career-bridge-frontend";
  tag = "latest";

  contents = [
    pkgs.nginx
    pkgs.cacert
  ];

  config = {
    Cmd = [
      "${pkgs.nginx}/bin/nginx"
      "-c" "${nginxConfig}"
      "-g" "daemon off;"
    ];
    ExposedPorts = { "8080/tcp" = {}; };
  };
}

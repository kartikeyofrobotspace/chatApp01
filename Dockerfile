# 🐳 Dockerfile - Build and run a SvelteKit app in a container

# 📌 What does this Dockerfile do?
# 1. It builds the SvelteKit app using a lightweight Node.js image.
# 2. It creates a separate, optimized production image to keep the final container small.
# 3. It runs the built app inside the container.
# ───────────────────────────────────────────

# 🛠️ Step 1: Build Stage
# ------------------------------
# We use a lightweight Node.js image (Alpine) to build the app.
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# 📝 Copy package files first to leverage Docker's caching mechanism.
# This ensures that dependencies are only reinstalled when package.json changes.
COPY package.json package-lock.json ./

# 📦 Install all dependencies (both development and production).
RUN npm install

# 📝 Copy the rest of the application files into the container.
COPY . .

# ⚙️ Build the SvelteKit app
# This generates the final compiled files.
RUN npm run build

# ───────────────────────────────────────────

# 🎯 Step 2: Production Image
# ------------------------------
# We create a separate, minimal image for running the app.
FROM node:18-alpine AS prod

# Set the working directory inside the container
WORKDIR /app

# 📦 Copy package files again (to install only production dependencies).
COPY package.json package-lock.json ./

# 🔧 Install only production dependencies (smaller image, faster startup).
RUN npm install --production

# 📂 Copy the built files from the previous build stage.
COPY --from=build /app/build /app/build

# 🚪 Expose the port the app will run on
EXPOSE 3000

# 🚀 Start the SvelteKit server
CMD ["node", "build"]

# ───────────────────────────────────────────
# ✅ This results in a smaller, optimized image for running the app in production.
# ───────────────────────────────────────────

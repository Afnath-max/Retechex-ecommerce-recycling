import mongoose from 'mongoose';

const globalCache = globalThis.__retechexMongoCache || {
  connection: null,
  promise: null,
  listenersAttached: false,
};

globalThis.__retechexMongoCache = globalCache;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 && globalCache.connection) {
    return globalCache.connection;
  }

  if (globalCache.promise) {
    return globalCache.promise;
  }

  try {
    globalCache.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    });

    const conn = await globalCache.promise;
    globalCache.connection = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    if (!globalCache.listenersAttached) {
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        globalCache.connection = null;
        globalCache.promise = null;
        console.log('⚠️  MongoDB disconnected');
      });

      if (process.env.NODE_ENV !== 'production') {
        process.once('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
          process.exit(0);
        });
      }

      globalCache.listenersAttached = true;
    }

    return conn;
  } catch (error) {
    globalCache.promise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;

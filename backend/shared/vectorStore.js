// Shared module to store vector store ID across routes
let vectorStoreId = 'vs_68d1f669721c8191bc4f45426c0a1105'; // Set the ID from our successful processing

const setVectorStoreId = (id) => {
  vectorStoreId = id;
};

const getVectorStoreId = () => {
  return vectorStoreId;
};

const hasIndexedFiles = () => {
  return !!vectorStoreId;
};

module.exports = {
  setVectorStoreId,
  getVectorStoreId,
  hasIndexedFiles
};

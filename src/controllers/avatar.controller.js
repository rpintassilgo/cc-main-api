const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const formidable = require('formidable');
const fs = require('fs');

const azureConnectionStr = process.env.AZURE_STORAGE_CONNECTION_STRING;

const uploadAvatar = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'File parsing error' });
    }

    const userId = req.params.userId;
    const file = files.file[0];

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Create a unique name for the blob
      const blobName = `${userId}/${file.newFilename}`;
      const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionStr);
      const containerClient = blobServiceClient.getContainerClient('avatars');
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Read file content
      const fileStream = fs.createReadStream(file.filepath);
      const fileSize = file.size;

      // Upload the file
      await blockBlobClient.uploadStream(fileStream, fileSize);

      // Generate SAS token
      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sasToken = generateBlobSASQueryParameters({
        containerName: 'avatars',
        blobName: blobName,
        permissions: permissions,
        expiresOn: new Date(9999, 11, 31)
      }, blobServiceClient.credential).toString();

      const avatarUrl = `${blockBlobClient.url}?${sasToken}`;

      // Update the user's avatar URL in the database
      await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

      res.json({ url: avatarUrl });
    } catch (error) {
      console.error("Error uploading file to Azure Blob Storage", error);
      res.status(500).json({ message: 'Error uploading file to Azure Blob Storage', error: error.message });
    }
  });
};

module.exports = { uploadAvatar };

"use strict";
const { contextBridge, ipcRenderer } = require('electron');
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Prompt optimization
    promptOptimize: (data) => ipcRenderer.invoke('prompt/optimize', data),
    // Image inpainting
    imageInpaint: (data) => ipcRenderer.invoke('image/inpaint', data),
    // Comment generation
    commentGenerate: (data) => ipcRenderer.invoke('comment/generate', data),
    // Image download
    imageDownload: (data) => ipcRenderer.invoke('image/download', data),
    // Storage upload
    storageUploadImage: (data) => ipcRenderer.invoke('storage/uploadImage', data),
    // Database operations
    dbInsertRecords: (data) => ipcRenderer.invoke('db/insertRecords', data),
    dbListGallery: (data) => ipcRenderer.invoke('db/listGallery', data),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require('react');
const { useState, useRef } = React;
const ImageEditor = () => {
    const [image, setImage] = useState({
        src: null,
        width: 0,
        height: 0
    });
    const [mask, setMask] = useState({
        src: null,
        width: 0,
        height: 0,
        mode: 'paint-white-to-edit',
        brushSize: 32,
        opacity: 0.6
    });
    const [promptInUse, setPromptInUse] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImage({
                    src: e.target?.result,
                    width: img.width,
                    height: img.height
                });
                // Reset mask when new image is loaded
                setMask(prev => ({
                    ...prev,
                    src: null,
                    width: img.width,
                    height: img.height
                }));
            };
            img.src = e.target?.result;
        };
        reader.readAsDataURL(file);
    };
    const handleApplyInpaint = async () => {
        if (!image.src || !mask.src || !promptInUse.trim())
            return;
        setLoading(true);
        try {
            const result = await window.electronAPI.imageInpaint({
                imageBase64: image.src,
                maskBase64: mask.src,
                prompt: promptInUse,
                strength: 0.75,
                guidance_scale: 7.5,
                num_inference_steps: 30
            });
            // Update image with result
            setImage(prev => ({
                ...prev,
                src: result.imageBufferBase64
            }));
            console.log('Inpainting completed:', result.meta);
        }
        catch (error) {
            console.error('Error applying inpainting:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDownload = async (format) => {
        if (!image.src)
            return;
        try {
            const result = await window.electronAPI.imageDownload({
                imageBase64: image.src,
                format
            });
            console.log('Image saved to:', result.savedPath);
        }
        catch (error) {
            console.error('Error downloading image:', error);
        }
    };
    const handleReset = () => {
        setImage({ src: null, width: 0, height: 0 });
        setMask({ src: null, width: 0, height: 0, mode: 'paint-white-to-edit', brushSize: 32, opacity: 0.6 });
        setPromptInUse('');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-primary-400 mb-2", children: "Image Editor" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400", children: "Upload, edit, and apply AI inpainting to your images" })] }), !image.src && ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-slate-400 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl mb-2", children: "\uD83D\uDCC1" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm", children: "Drop image here" })] }) }), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => fileInputRef.current?.click(), className: "btn-primary", children: "Choose Image" })] }) })), image.src && ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Prompt for Inpainting" }), (0, jsx_runtime_1.jsx)("textarea", { value: promptInUse, onChange: (e) => setPromptInUse(e.target.value), placeholder: "Enter prompt for AI editing...", className: "input-field w-full h-20 resize-none" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center text-slate-400", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl mb-2", children: "\uD83C\uDFA8" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm", children: "Canvas with Konva integration" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs mt-1", children: ["Image: ", image.width, " x ", image.height] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-slate-700 border border-slate-600 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-slate-300 mb-2", children: "Tools" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-secondary text-xs", children: "Select" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary text-xs", children: "Brush" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary text-xs", children: "Erase" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary text-xs", children: "Rectangle" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary text-xs", children: "Lasso" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleApplyInpaint, disabled: !mask.src || !promptInUse.trim() || loading, className: "btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Processing...' : 'Apply Inpainting' }), (0, jsx_runtime_1.jsx)("button", { onClick: handleReset, className: "btn-secondary", children: "Reset" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleDownload('png'), className: "btn-secondary text-xs", children: "PNG" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDownload('jpeg'), className: "btn-secondary text-xs", children: "JPG" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDownload('webp'), className: "btn-secondary text-xs", children: "WebP" })] })] })] }))] }));
};
module.exports = { default: ImageEditor };

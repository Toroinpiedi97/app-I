"use strict";
// Environment configuration for AIDesktop Image Suite
const config = {
    // Hugging Face API Configuration
    HF_API_KEY: process.env.HF_API_KEY || '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',
    HF_PROMPT_MODEL: process.env.HF_PROMPT_MODEL || 'google/flan-t5-base',
    HF_INPAINT_MODEL: process.env.HF_INPAINT_MODEL || 'stabilityai/stable-diffusion-2-inpainting',
    HF_COMMENT_MODEL: process.env.HF_COMMENT_MODEL || 'tiiuae/falcon-7b-instruct',
    // Supabase Configuration
    SUPABASE_URL: process.env.SUPABASE_URL || 'your_supabase_project_url_here',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'images',
    // App Configuration
    APP_NAME: 'AIDesktop Image Suite',
    APP_VERSION: '0.1.0',
    // Development
    IS_DEV: process.env.NODE_ENV === 'development',
    // API Endpoints
    HF_BASE_URL: 'https://api-inference.huggingface.co/models/',
};
module.exports = { config };

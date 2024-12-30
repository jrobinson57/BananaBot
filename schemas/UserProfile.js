const { Schema, model } = require('mongoose');

const userProfileSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    evolutionStage: {
        type: String,
        default: '1',
    },
    lastDailyCollected: {
        type: Date,
    },
    evorollCoins: {
        type: Number,
        default: '0',
    },
    iHaveBanana: {
        type: Boolean,
        default: false,
    },
    iHavePowerBanana: {
        type: Boolean,
        default: false,
    },
    iHaveSoulBanana: {
        type: Boolean,
        default: false,
    },
    iHaveTimeBanana: {
        type: Boolean,
        default: false,
    },
    iHaveMindBanana: {
        type: Boolean,
        default: false,
    },
    iHaveRealityBanana: {
        type: Boolean,
        default: false,
    },
    iHaveSpaceBanana: {
        type: Boolean,
        default: false,
    },
    iHaveGun: {
        type: Number,
        default: 0,
    },
    nextRoll: {
        type: Number,
        default: 0,
    },
    soulBananaUsage: {
        type: Date,
        default: 2024-9-15,
    },

}, 
{ timestamps: true, strict: false }
);

module.exports = model('UserProfile', userProfileSchema)

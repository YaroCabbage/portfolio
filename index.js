var express = require("express");





//require('greenlock-express')
require('greenlock-express').create({

    // Let's Encrypt v2 is ACME draft 11
    version: 'draft-11'


    // Note: If at first you don't succeed, stop and switch to staging
    // https://acme-staging-v02.api.letsencrypt.org/directory

    // You MUST change this to a valid email address
    , email: 'who.agent007@gmail.com'

    // You MUST NOT build clients that accept the ToS without asking the user
    , agreeTos: true

    // You MUST change these to valid domains
    // NOTE: all domains will validated and listed on the certificate
    , approvedDomains: [ 'moor.one', 'www.moor.one','rchain.moor.one','app.moor.one' ]

    // You MUST have access to write to directory where certs are saved
    // ex: /home/foouser/acme/etc
    , configDir: '~/.config/acme/'

    , app: require('./app')

    // Get notified of important updates and help me make greenlock better
    , communityMember: true

//, debug: true

}).listen(80, 443);
console.log("launched portfolio");

# s3-upload-vanilla-js
Lightweight vanilla JS code example for uploading a file to S3 with zero dependencies.

This is only really useful in secure environments (as your AWS keys will be exposed) where you don't want to (or can't) import the aws-sdk. 

Don't put this in client code _obviously_

## How to use

This example constructs a presigned upload URL using your AWS keys and then uses fetch to upload your file.
Simple.

## Why did I make this?

I wanted to create a lightweight script for uploading content directly to S3 storage from my [Obsidian](https://obsidian.md/) notes, from there my NextJS Portfolio site uses [ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration) to generate content.

# Smart Image CDN Monorepo

Smart Image CDN is an open-source project that helps you dealing with image processing including resizing and automatically providing the images in WEBP format if for the supported browsers.

The image processing API is provided through simple GET-requests and query string parameters
```
# Example
https://images.yoursite.com/path/to/image.jpg?w=150&h150&q=70
```

**IMPORTANT**: Use Yarn as package manager.

## How to run
Use these command in the monorepo root
```
# Start express server
yarn start:express

# Just run build the library
yarn build:lib

# run tests
yarn test
```

## Contributions
All contrubutions are welcome. I would be delighted to see this project growing and stabilizing.

### Issues
Please, use the github issue tracker.

### Pull requests
Want to contribute and make a PR? Great! Please provide some context within the description and if possible, write tests.

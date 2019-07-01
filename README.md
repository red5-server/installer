# Red5 Command Line Tool

* [Installation](#Installation)
* Project Management
  * [New Project](#New-Project)
* Package Management
  * [Add Package](#Add-Package)
  * [Remove Package](#Remove-Package)
* Making Files
  * [Make Controller](#Make-Controller)
  * [Make Middleware](#Make-Middleware)

## Installation

To install the command line tool run an `npm install`

```
npm install -g @red5/cli
```

Once installed you can create projects and project files.

## New Project

New projects are created by going to the directory that you want to create a new project within. The command will then create a new folder and install everything into that folder.

```
red5 new <project-name>
```

The following steps are taken:

1. `git clone` the bare bones project from [github](https://github.com/red5-server/red5)
2. Install the node dependencies
3. Start a test server
4. Opens `http://localhost:5000` within a browser to make sure everything works

## Add Package

Adds a supported `@red5` package to the current project.

```
red5 add <package-name>
```

The following steps are taken:

1. Check the registry to make sure the package is a red5 package (`@red5/<package-name>`)
2. If the package exists, install it `npm i -s @red5/<package-name>`

## Remove Package

Removes a supported `@red5` package from the current project.

```
red5 remove <package-name>
```

The following steps are taken:

1. Check the registry to make sure the package is a red5 package (`@red5/<package-name>`)
2. If the package exists, remove it `npm rm -s @red5/<package-name>`

## Make Controller

Make controller can create 3 different types of controllers:

* A basic controller (default)
* An API controller
* A Resource controller
---
Creates a basic controller containing only a `main` endpoint. This is the default action.
```
red5 make:controller <controller-name>
```

Creates an **API controller** containing only API endpoints
```
red5 make:controller <controller-name> --api
```

Creates a **Resource controller** containing all resource endpoints
```
red5 make:controller <controller-name> --resource
```

## Make Middleware

Make Middleware will make middleware that can then be hooked into within your routes.

```
red5 make:middleware <middleware-name>
```
const Grid = {
    WIDTH: 1400,
    HEIGHT: 600,
    STEP: 25,
    NUMBER_OF_CITIES: 479,
    TEMP_CITIES: 10,
    SEED: 3819201,
    WEST: 0,
    NORTH: 1,
    EAST: 2,
    SOUTH: 3
}

let random = new CustomRandom(Grid.SEED);

function CustomRandom(seed) {
    var self = this;
    if (seed == null) {
        seed = Date.now();
    }
    var A = 1103515245; // multiplier
    var C = 12345;      // incrementer
    var M = 2147483647; // modulus == max integer value
    self.nextInt = function() {
        seed = (seed * A + C) % M;
        return seed;
    };
    self.nextDouble = function() {
        var value = self.nextInt();
        return value / M;
    };
}

function getPosition(y, x) {
    return y * Grid.WIDTH + x
}

class MainGrid {
    constructor(w, h, step, canvasId) {
        // canvasId = grid

        let canvas = document.getElementById(canvasId);
        canvas.width  = w;
        canvas.height = h;
        this.width = w;
        this.height = h;
        this.step = step
        this.ctx = canvas.getContext('2d');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        for (let x = 0; x <= this.width; x += this.step) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        // set the color of the line
        this.ctx.strokeStyle = 'rgb(20,20,20)';
        this.ctx.lineWidth = 1;

        this.ctx.stroke();

        this.ctx.beginPath();
        for (let y = 0; y <= this.height; y += this.step) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }

        this.ctx.strokeStyle = 'rgb(20,20,20)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        return this.ctx
    }
}

class Solution {
    solve(ctx) {
        let tCities = new Cities(ctx, "rgb(255, 191, 0)")
        let changes = 0
        let counterId = document.getElementsByTagName("h2");
        tCities.draw(ctx, 'rgb(0, 0, 255)')

        tCities.tCity[0].draw(ctx, 'rgb(0, 255, 0)')
        tCities.tCity[Grid.NUMBER_OF_CITIES - 1].draw(ctx, 'rgb(255, 0, 128)')
        // tCities.tCity[Grid.TEMP_CITIES - 1].draw(ctx, 'rgb(255, 0, 128)')

        let route = new Tour(tCities.tCity[0], tCities.tCity[1], tCities.tCity[2])

        for (let c = 3; c < tCities.tCity.length; c++) {
            route.addCity(tCities.tCity[c])
            mainGrid.draw()
            tCities.draw(ctx, 'rgb(0, 0, 255)')
            // route.draw(ctx)
            changes = route.adjustRoute()
            route.draw(ctx)
        }

        console.log("F I N A L => ROUTE " + route.size() + " cities")
        route.draw(ctx)

        counterId[0].innerHTML = "tour length: " + route.getRouteLength()
    }
}

class Tour {
    constructor(city1, city2, city3) {
        console.log("Start of tour")
        let cityNode1 = new ListNode(city1)
        let cityNode2 = new ListNode(city2)
        let cityNode3 = new ListNode(city3)

        this.tour = new LinkedList(cityNode1)
        this.tour.appendNode(cityNode2)
        this.tour.appendNode(cityNode3)
        console.log("End of tri-tour")
    }

    listDump() {
        let node = this.tour.head
        console.log("Head node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        /*
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
        node = node.next
        console.log("     node data: " + node.data.x + "," + node.data.y)
         */
    }

    addCity(newCity) {
        console.log("****** New City *********")
        let cityNode = new ListNode(newCity)

        this.addCityNode(cityNode)
    }

    addCityNode(cityNode) {
        let prevNode = this.tour.head
        let routeLength = 0
        let shortestRoute = Infinity
        let minPrevNode = null

        while(prevNode !== null) {
            this.tour.insertNodeAfter(prevNode, cityNode)
            routeLength = this.getRouteLength()
            if (routeLength < shortestRoute) {
                shortestRoute = routeLength
                minPrevNode = prevNode
            }
            this.tour.removeNodeAfter(prevNode)
            prevNode = prevNode.next
        }
        this.tour.insertNodeAfter(minPrevNode, cityNode)
    }

    adjustRoute() {
        let dirty = true
        let dirtyNum = 0
        let previousCity = this.tour.head
        let currentCity = previousCity.next

        while(dirty) {
            dirty = false
            previousCity = this.tour.head
            currentCity = this.tour.head.next
            while(currentCity !== null) {
                this.tour.removeNodeAfter(previousCity)
                this.addCityNode(currentCity)
                if(previousCity.next !== currentCity) {
                    dirtyNum++
                    dirty = true
                    break
                }
                previousCity = currentCity
                currentCity = currentCity.next
            }
        }
        return dirtyNum
    }

    getRouteLength() {
        let currentNode = this.tour.head
        let nextNode = null
        let length = 0
        let dx = 0.0
        let dy = 0.0

        // this.listDump()

        while(currentNode.next != null) {
            nextNode = currentNode.next
            dx = (currentNode.data.x - nextNode.data.x)
            dy = (currentNode.data.y - nextNode.data.y)

            length += Math.sqrt(dx * dx + dy * dy)
            currentNode = currentNode.next
        }

        nextNode = this.tour.head
        dx = (currentNode.data.x - nextNode.data.x)
        dy = (currentNode.data.y - nextNode.data.y)

        length += Math.sqrt(dx * dx + dy * dy)

        return length
    }

    draw(ctx, tColor = "rgb(255, 191, 0)") {
        let currentNode = this.tour.head
        ctx.beginPath();
        while(currentNode.next != null) {
            ctx.moveTo(currentNode.data.x, currentNode.data.y)
            ctx.lineTo(currentNode.next.data.x, currentNode.next.data.y)
            currentNode = currentNode.next
        }

        ctx.lineTo(currentNode.data.x, currentNode.data.y)
        ctx.lineTo(this.tour.head.data.x, this.tour.head.data.y)
        ctx.strokeStyle = tColor
        ctx.lineWidth = 3
        ctx.stroke();
    }

    size() {
        return this.tour.size()
    }

}

class CityLoc {
    constructor(loc, used) {
        this.loc = loc
        this.used = used
    }
}

class Cities {
    constructor(ctx, tColor) {
        this.tCity = []
        this.westeast = []
        this.northsouth = []
        this.usedArray = []
        this.cArray = []
        this.counter = 0
        this.minx = 0
        this.maxx = Grid.NUMBER_OF_CITIES - 1
        // this.maxx = Grid.TEMP_CITIES - 1
        this.miny = 0
        this.maxy = Grid.NUMBER_OF_CITIES - 1
        // this.maxy = Grid.TEMP_CITIES - 1
        let x = 0
        let y = 0
        let cityLoc = 0
        let index = 0
        let city = null

        this.getCities()
        this.draw(ctx, tColor)

        for(let c = 0; c < Grid.NUMBER_OF_CITIES; c++) {
        // for(let c = 0; c < Grid.TEMP_CITIES; c++) {
            city = this.tCity[c]
            this.westeast.push(city)
            this.northsouth.push(city)
            cityLoc = new CityLoc(getPosition(city.y, city.x), false)
            this.usedArray.push(cityLoc)
            // alert(this.tCity[c].x + " ::: " + this.tCity[c].y)
        }

        this.westeast.sort(function(a, b) {
            if( a.x < b.x) {
                return -1;
            }
            else if(a.x === b.x) {
                return a.y - b.y
            }
            return 1
        })

        this.northsouth.sort(function(a, b) {
            if( a.y < b.y) {
                return -1;
            }
            else if(a.y === b.y) {
                return a.x - b.x
            }
            return 1
        })

        this.usedArray.sort( function(a, b) {
            return a.loc - b.loc
        })

        // add cities to a cities array 1 by 1 in a spiral motion

        // for(let c=0; c< Grid.NUMBER_OF_CITIES; c++) {
        //     console.log(this.usedArray[c].loc)
        // }

        // for(let c=0; c< Grid.TEMP_CITIES; c++) {
        //     console.log(this.usedArray[c].loc)
        // }

        // for(let c=0; c < Grid.TEMP_CITIES; c++) {
        //     console.log("(" + this.westeast[c].y + " " + this.westeast[c].x + " " +getPosition(this.westeast[c].y, this.westeast[c].x) + ")")
        // }

        let c = 0
        let ndx = 0

        while( c < Grid.NUMBER_OF_CITIES) {
        // while( c < Grid.TEMP_CITIES) {
            ndx = this.getNextWestCity()
            if(ndx !== null) {
                this.cArray.push(ndx)
                this.minx++
                c++
            }
            if (c >= Grid.NUMBER_OF_CITIES) break
            // if (c >= Grid.TEMP_CITIES) break

            ndx = this.getNextNorthCity()
            if(ndx !== null) {
                this.cArray.push(ndx)
                this.miny++
                c++
            }
            if (c >= Grid.NUMBER_OF_CITIES) break

            ndx = this.getNextEastCity()
            if(ndx !== null) {
                this.cArray.push(ndx)
                this.maxx--
                c++
            }
            if (c >= Grid.NUMBER_OF_CITIES) break
            // if (c >= Grid.TEMP_CITIES) break

            ndx = this.getNextSouthCity()
            if(ndx !== null) {
                this.cArray.push(ndx)
                this.maxy--
                c++
            }

            if (c >= Grid.NUMBER_OF_CITIES) break
            // if (c >= Grid.TEMP_CITIES) break
        }

        alert("...done")
    }

    getNextWestCity() {
        let cityLoc = 0
        let index = -1

        while(true) {
            // find out if city has already been added
            if(this.minx < Grid.NUMBER_OF_CITIES) {
                console.log(" *** " + this.minx + " *** ")
                cityLoc = getPosition(this.westeast[this.minx].y, this.westeast[this.minx].x)
                index = this.binarySearch(cityLoc)
            }
            if(index < 0) return null
            if(this.usedArray[index].used === false) {
                this.usedArray[index].used = true
                break
            }
            this.minx++
        }
        return this.westeast[this.minx]
    }

    getNextNorthCity() {
        let cityLoc = 0
        let index = -1

        while(true) {
            // find out if city has already been added
            if(this.miny < Grid.NUMBER_OF_CITIES) {
                cityLoc = getPosition(this.northsouth[this.miny].y, this.northsouth[this.miny].x)
                index = this.binarySearch(cityLoc)
            }
            if(index < 0) return null
            if(this.usedArray[index].used === false) {
                this.usedArray[index].used = true
                break
            }
            this.miny++
        }
        return this.northsouth[this.miny]
    }

    getNextEastCity() {
        let cityLoc = 0
        let index = -1

        while(true) {
            // find out if city has already been added
            if(this.maxx >= 0) {
                cityLoc = getPosition(this.westeast[this.maxx].y, this.westeast[this.maxx].x)
                index = this.binarySearch(cityLoc)
            }
            if(index < 0) return null

            if(this.usedArray[index].used === false) {
                this.usedArray[index].used = true
                break
            }
            this.maxx--
        }
        return this.westeast[this.maxx]
    }

    getNextSouthCity() {
        let cityLoc = 0
        let index = 0

        while(true) {
            if(this.maxy >= 0) {
                cityLoc = getPosition(this.northsouth[this.maxy].y, this.northsouth[this.maxy].x)
                index = this.binarySearch(cityLoc)
            }
            if(index < 0) return null

            console.log("Next SouthCity maxy: " + this.maxy)
            // find out if city has already been added

            if(this.usedArray[index].used === false) {
                this.usedArray[index].used = true
                break
            }
            this.maxy--
        }
        return this.northsouth[this.maxy]
    }

    binarySearch(cityLoc) {
        let min = 0
        let max = Grid.NUMBER_OF_CITIES - 1
        // let max = Grid.TEMP_CITIES - 1
        let middle = 0
        let midValue = 0
        let found = false

        while(true) {
            middle = min + Math.floor((max - min + 1) / 2)
            midValue = this.usedArray[middle].loc

            // console.log("cityLoc = " + cityLoc + " min = " + min + " middle = " + middle + " max = " + max)

            if(cityLoc === this.usedArray[min].loc)
                return min

            if(cityLoc === midValue) {
                return middle
            }

            if(cityLoc === this.usedArray[max].loc) {
                return max
            }

            if(cityLoc < midValue) {
                max = middle
            } else if(cityLoc > midValue) {
                min = middle
            }

            if(max === min) break
        }

        return -1
    }

    getCities() {
        // let dummy = null
        // for(let c=0; c < 470; c++) {
        //     dummy = new City()
        // }
        for (let c=0; c < Grid.NUMBER_OF_CITIES; c++) {
            this.tCity[c] = new City()
        }

        // for (let c=0; c < Grid.TEMP_CITIES; c++) {
        //     this.tCity[c] = new City()
        // }
    }

    draw(ctx, cColor) {
        for(let c = 0; c < Grid.NUMBER_OF_CITIES; c++) {
        // for(let c = 0; c < Grid.TEMP_CITIES; c++) {
            console.log("x: " + this.tCity.x + ", y: " + this.tCity.y)
            this.tCity[c].draw(ctx, cColor)
        }
    }
}

class City {
    constructor() {
        this.x = random.nextInt() % Grid.WIDTH + 1
        this.y = random.nextInt() % Grid.HEIGHT + 1
    }

    draw(ctx, sColor) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.strokeStyle = sColor;
        ctx.fillStyle = sColor;
        ctx.fill();
        ctx.stroke();
    }
}

class LinkedList {
    constructor(head = null) {
        this.head = head
        this.tail = head
    }

    listDump() {
        let currentNode = this.head
        console.log("cnode data: " + currentNode.data.x + " next:" + currentNode.next)

        currentNode = currentNode.next
        console.log("cnode data: " + currentNode.data.x + " next:" + currentNode.next)

        currentNode = currentNode.next
        console.log("cnode data: " + currentNode.data.x + " next:" + currentNode.next)
    }

    size() {
        let x = 0
        let node = this.head
        while(node.next != null) {
            x++
            node = node.next
        }
        return x
    }

    find(data) {
        let currentNode = this.head
        while (true) {
            if (currentNode == null) return null
            if (this.data === currentNode.data) break
        }
        return currentNode
    }

    isEmpty() {
        return this.head == null
    }

    appendNode(node) {
        if( this.head === null) {
            this.head = node
            this.tail = node
            node.next = null
            return
        }
        this.tail.next = node
        this.tail = node
    }

    insertNodeAfter(prevNode, node) {
        node.next = prevNode.next
        prevNode.next = node
        if(node.next === null) {
            this.tail = node
        }
    }

    removeNodeAfter(prevNode) {
        if(prevNode.next === null) {
            console.log("Node after tail does not exist!")
            return
        }
        prevNode.next = prevNode.next.next
        if(prevNode.next === null) {
            this.tail = prevNode
        }
    }
}

class ListNode {
    constructor(data) {
        this.data = data
        this.next = null
    }
}

/*
Xn+1 = (aXn + c) mod m
where X is the sequence of pseudo-random values
m, 0 < m  - modulus
a, 0 < a < m  - multiplier
c, 0 ≤ c < m  - increment
x0, 0 ≤ x0 < m  - the seed or start value
*/

console.log("Hello partner!")

let mainGrid = new MainGrid(Grid.WIDTH, Grid.HEIGHT, Grid.STEP, "grid")
let ctx = mainGrid.draw()

let solution = new Solution()
solution.solve(ctx)

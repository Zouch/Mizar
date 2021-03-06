// Generated by CoffeeScript 2.5.1
// Note: modified to be exported as a module

function astro() {
  var Base, FITS, Parser;

  // if (this.astro == null) {
  this.astro = {};
  // }

  Base = class Base {
    static include(obj) {
      var key, value;
      for (key in obj) {
        value = obj[key];
        this.prototype[key] = value;
      }
      return this;
    }

    static extend(obj) {
      var key, value;
      for (key in obj) {
        value = obj[key];
        this[key] = value;
      }
      return this;
    }

    proxy(func) {
      return () => {
        return func.apply(this, arguments);
      };
    }

    invoke(callback, opts, data) {
      var context;
      context = (opts != null ? opts.context : void 0) != null ? opts.context : this;
      if (callback != null) {
        return callback.call(context, data, opts);
      }
    }
  };

  Parser = function () {
    class Parser extends Base {
      // FITS objects are constructed using either
      // 1) Path to a remote FITS file
      // 2) Native File object

      // First argument is either a path or File object
      // Second argument is a callback to execute after
      // initialization is complete
      // Third argument is a set of options that may be passed
      // to the callback.  If opts has the context key, the callback
      // is executed with respect to that context.
      constructor(arg, callback1, opts1) {
        var xhr;
        super();
        this.arg = arg;
        this.callback = callback1;
        this.opts = opts1;
        // Storage for header dataunits
        this.hdus = [];

        // Set initial state for parsing buffer
        // Blocks of 2880 will be read until an entire header is read.
        // The process will be repeated until all headers have been parsed from file.

        // Number of 2880 blocks read.  This is reset every time an entire header is extracted.
        this.blockCount = 0;

        // Byte offsets relative to the current header
        this.begin = 0;
        this.end = this.BLOCKLENGTH;

        // Byte offset relative to the file
        this.offset = 0;

        // Initial storage for storing header while parsing.
        this.headerStorage = new Uint8Array();

        // Check the input type for either
        // 1) Path to remote file
        // 2) Native File object
        if (typeof this.arg === "string") {
          // Define function at runtime for getting next block
          this.readNextBlock = this._readBlockFromBuffer;

          // Get the remote file as an arraybuffer
          xhr = new XMLHttpRequest();
          xhr.open("GET", this.arg);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            // Error handling on the response status
            if (xhr.status !== 200) {
              // Execute callback returning a null object on failure
              this.invoke(this.callback, this.opts);
              return;
            }

            // Get buffer from response
            this.arg = xhr.response;

            // Store the buffer byte length
            this.length = this.arg.byteLength;

            // Begin reading buffer
            return this.readFromBuffer();
          };

          // Send the request
          xhr.send();
        } else {
          // Store the file byte length
          this.length = this.arg.size;

          // Define function at runtime for getting next block
          this.readNextBlock = this._readBlockFromFile;

          // Get the local file as an arraybuffer
          this.readFromFile();
        }
      }

      // Interpret an array buffer that is already copied in memory.  Usually
      // used for remote files, though this can be used for local files if
      // the arraybuffer is already in memory.
      readFromBuffer() {
        var block;

        // Get first 2880 block
        block = this.arg.slice(this.begin + this.offset, this.end + this.offset);

        // Begin parsing for headers
        return this.readBlock(block);
      }

      // Read a file by copying only the headers into memory.  This is needed
      // to handle large files efficiently.
      readFromFile() {
        var block;

        // Initialize a new FileReader
        this.reader = new FileReader();

        // Set reader handler
        this.reader.onloadend = (e) => {
          return this.readBlock(e.target.result);
        };

        // Get first 2880 block
        block = this.arg.slice(this.begin + this.offset, this.end + this.offset);

        // Begin parsing for headers
        return this.reader.readAsArrayBuffer(block);
      }

      // Read a 2880 size block. Function is responsible for storing block,
      // searching for END marker, initializing an HDU, and clearing storage.
      readBlock(block) {
        var arr, dataLength, dataunit, header, i, len, ref, rowIndex, rows, s, slice, tmp, value;

        // Read block as integers
        arr = new Uint8Array(block);

        // Temporary storage for header
        tmp = new Uint8Array(this.headerStorage);

        // Reallocate header storage
        this.headerStorage = new Uint8Array(this.end);

        // Copy contents from temporary storage
        this.headerStorage.set(tmp, 0);

        // Copy contents from current iteration
        this.headerStorage.set(arr, this.begin);

        // Check current array one row at a time starting from
        // bottom of the block.
        rows = this.BLOCKLENGTH / this.LINEWIDTH;
        while (rows--) {
          // Get index of first element in row
          rowIndex = rows * this.LINEWIDTH;
          if (arr[rowIndex] === 32) {
            // Go to next row if whitespace found
            continue;
          }

          // Check for END keyword with trailing space (69, 78, 68, 32)
          if (
            arr[rowIndex] === 69 &&
            arr[rowIndex + 1] === 78 &&
            arr[rowIndex + 2] === 68 &&
            arr[rowIndex + 3] === 32
          ) {
            // Interpret as string
            s = "";
            ref = this.headerStorage;
            for (i = 0, len = ref.length; i < len; i++) {
              value = ref[i];
              s += String.fromCharCode(value);
            }
            header = new Header(s);

            // Get data unit start and length
            this.start = this.end + this.offset;
            dataLength = header.getDataLength();

            // Create data unit instance
            slice = this.arg.slice(this.start, this.start + dataLength);
            if (header.hasDataUnit()) {
              dataunit = this.createDataUnit(header, slice);
            }

            // Store HDU on instance
            this.hdus.push(new HDU(header, dataunit));

            // Update byte offset
            this.offset += this.end + dataLength + this.excessBytes(dataLength);

            // Return if at the end of file
            if (this.offset === this.length) {
              this.headerStorage = null;
              this.invoke(this.callback, this.opts, this);
              return;
            }

            // Reset variables for next header
            this.blockCount = 0;
            this.begin = this.blockCount * this.BLOCKLENGTH;
            this.end = this.begin + this.BLOCKLENGTH;
            this.headerStorage = new Uint8Array();

            // Get next block
            block = this.arg.slice(this.begin + this.offset, this.end + this.offset);

            // Begin parsing for next header
            this.readNextBlock(block);
            return;
          }
          break;
        }

        // Read next block since END not found
        this.blockCount += 1;
        this.begin = this.blockCount * this.BLOCKLENGTH;
        this.end = this.begin + this.BLOCKLENGTH;
        block = this.arg.slice(this.begin + this.offset, this.end + this.offset);
        this.readNextBlock(block);
      }

      // Use one of these depending on the initialization parameter (File or ArrayBuffer)
      _readBlockFromBuffer(block) {
        return this.readBlock(block);
      }

      _readBlockFromFile(block) {
        return this.reader.readAsArrayBuffer(block);
      }

      // Create the appropriate data unit based on info from header
      createDataUnit(header, blob) {
        var type;
        type = header.getDataType();
        return new astro.FITS[type](header, blob);
      }

      // Determine the number of characters following a header or data unit
      excessBytes(length) {
        return (this.BLOCKLENGTH - (length % this.BLOCKLENGTH)) % this.BLOCKLENGTH;
      }

      // Check for the end of file
      isEOF() {
        if (this.offset === this.length) {
          return true;
        } else {
          return false;
        }
      }
    }

    Parser.prototype.LINEWIDTH = 80;

    Parser.prototype.BLOCKLENGTH = 2880;

    // Prefix function for Safari :(
    File.prototype.slice = File.prototype.slice || File.prototype.webkitSlice;

    Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice;

    return Parser;
  }.call(this);

  FITS = class FITS extends Base {
    constructor(arg, callback, opts) {
      var parser;
      super();
      this.arg = arg;
      parser = new Parser(this.arg, (fits) => {
        this.hdus = parser.hdus;
        return this.invoke(callback, opts, this);
      });
    }

    // Public API

    // Returns the first HDU containing a data unit.  An optional argument may be passed to retreive
    // a specific HDU
    getHDU(index) {
      var hdu, i, len, ref;
      if (index != null && this.hdus[index] != null) {
        return this.hdus[index];
      }
      ref = this.hdus;
      for (i = 0, len = ref.length; i < len; i++) {
        hdu = ref[i];
        if (hdu.hasData()) {
          return hdu;
        }
      }
    }

    // Returns the header associated with the first HDU containing a data unit.  An optional argument
    // may be passed to point to a specific HDU.
    getHeader(index) {
      return this.getHDU(index).header;
    }

    // Returns the data object associated with the first HDU containing a data unit.  This method does not read from the array buffer
    // An optional argument may be passed to point to a specific HDU.
    getDataUnit(index) {
      return this.getHDU(index).data;
    }
  };

  FITS.version = "0.6.5";

  this.astro.FITS = FITS;

  // return this.astro;
}

export default new astro();

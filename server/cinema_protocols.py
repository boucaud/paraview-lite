import os
from paraview import simple
from paraview.web import protocols as pv_protocols
from wslink import register as exportRpc

class ParaViewWebCinemaReader(pv_protocols.ParaViewWebProtocol):
    def __init__(self, baseDir=None, **kwargs):
        super(ParaViewWebCinemaReader, self).__init__()
        self.currentIndex = -1
        self.currentFileName = ''
        self.databasePath = ''

    @exportRpc("pv.cinema.load.database")
    def loadCinemaDatabase(self, cdbPath):
        validPath = self.getAbsolutePath(cdbPath)
        if not os.path.isdir(validPath):
            return {'success': False,
                    'reason': 'Not a valid database. Should be a .cdb directory'}

        for entry in os.listdir(validPath):
            if os.path.isfile(entry):
                (r, extension) = os.path.splitext(entry)
                if extension == '.csv':
                    self.databasePath = entry
                    return loadCinemaFile(1)

    @exportRpc("pv.cinema.load.file")
    def loadCinemaFile(self, index):
        import csv
        with open(validPath) as csvfile:
            cinemaReader = csv.reader(csvfile, delimiter=',')
        lineNumber = 0
        pathIdx = 0
        for row in cinemaReader:
            if lineNumber == 0:
                pathIdx = row.index('FILE')
            elif lineNumber == index:
                self.currentIndex = index
                directory = os.path.dirname(self.databasePath)
                filePath = directory + row[pathIdx]
                reader = simple.OpenDataFile(filepath)
                simple.Show(reader)
                simple.Render()
                simple.ResetCamera()
                if self.getApplication():
                    self.getApplication().InvokeEvent('UpdateEvent')

                return { 'success': True, 'id': reader.GetGlobalIDAsString() }

            lineNumber += 1

    @exportRpc("pv.cinema.currentfile")
    def getName(self):
        return self.currentFileName

    @exportRpc("pv.cinema.currentindex")
    def getName(self):
        return self.currentIndex

    @exportRpc("pv.cinema.databasesize")
    def getNumberOfDataset(self):
        import csv
        with open(self.databasePath) as csvfile:
            cinemaReader = csv.reader(csvfile, delimiter=',')
        return sum(1 for row in cinemaReader) - 1


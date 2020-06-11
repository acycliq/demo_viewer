function config() {
    var ini = [
        {
            name: 'default',
            roi: {"x0": 0, "x1": 27352, "y0": 0, "y1": 20268}, // Now I am confused!! (ah ok, see note below)
            imageSize: [262144, 194250],
            cellBoundaries: './dashboard/cell_coords_rot.json',
            // cellData: './data/cell_call_demo_data/mouse_full_coronal/cell_type_output/cellData.json',
            tiles: 'https://raw.githubusercontent.com/acycliq/full_coronal_rot_datastore/master/{z}/{y}/{x}.png',
            spot_json: function(d){ return "https://raw.githubusercontent.com/acycliq/full_coronal_json_files/master/data/cell_call_demo_data/" + 'mouse_full_coronal/' + 'cell_type_output/' + 'geneData_rot_split/' + 'geneData_rot_' + d + '.json'},
            cell_json: function(d){ return "https://raw.githubusercontent.com/acycliq/full_coronal_json_files/master/data/cell_call_demo_data/" + 'mouse_full_coronal/' + 'cell_type_output/' + 'cellData_rot_split/' + 'cellData_rot_' + d + '.json'},
            num_jsons: 15 // number of json splits
        }, // 1
    ];
    var out = d3.map(ini, function (d) {
        return d.name;
    });
    return out
}

//
// ok here it is... map tiles and fov arent produced by the same image, that's why the background image and the data plotted are misaligned (I think!).
// You padded the original image to make the longer side a multiple of 2000 whereas you just scaled it up to the correct dimension
// when you did the pyramid tiles
//

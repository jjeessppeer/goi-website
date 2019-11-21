


function initializeDamageCalculator() {
    // Bind events
    $("#gunSelect,#ammoSelect,#buffedCheckbox,#armorUnitSelect,#hullUnitSelect,#balloonUnitSelect,#componentUnitSelect").on("change", updateGunInfoTable);



    $("#distanceRange,#timeRange").on("input", updateGunInfoTable);


    $("#damageCalcCustomAmmoInput input").on("input", updateGunInfoTable);
    $("#damageCalcCustomAmmoInput input").on("input", exportCustomAmmo);

    $("#damageCalcCustomAmmoCheck").on("change", function(e){
        if ($("#damageCalcCustomAmmoCheck").is(":checked")){
            $("#damageCalcCustomAmmoInput").show();
            $("#damageCalcAmmoInput").hide();
            importSelectedAmmo();
            exportCustomAmmo();
        }
        else {
            $("#damageCalcCustomAmmoInput").hide();
            $("#damageCalcAmmoInput").show();
        }
    })

    // $("#distanceText").inputFilter(function (value) {
    //     console.log(this);
    //     return /^[\d]*?$/.test(value) && (!parseInt(value) || parseInt(value) < 100) //allow float in range 0 to 1, or nothing.
    //   });
    // Update table
    updateGunInfoTable();
    // exportCustomAmmo();
    // importCustomAmmo(btoa("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15"));
    if (window.location.hash.substr(1).split("?")[0] == "damageCalculator" && getUrlParam(window.location.href)){
        importCustomAmmo(getUrlParam(window.location.href));
        $("#damageCalcCustomAmmoCheck").prop('checked', true);
        $("#damageCalcCustomAmmoInput").show();
        $("#damageCalcAmmoInput").hide();
    }
}

function exportCustomAmmo(){
    let inputs = $("#damageCalcCustomAmmoInput input");
    let export_string = "";
    for (let i=0; i < inputs.length; i++) {
        export_string += inputs[i].value + ",";
    }
    export_string = btoa(export_string);

    if (window.location.hash.substr(1).split("?")[0] == "damageCalculator"){
        setUrlParam(export_string);
    }
    // return export_string;
}

function importCustomAmmo(import_string){
    import_string = atob(import_string);
    let data = import_string.split(",");
    let inputs = $("#damageCalcCustomAmmoInput input");
    for (let i=0; i < inputs.length; i++) {
        $(inputs[i]).val(data[i]);
    }
    updateGunInfoTable();
}

function importSelectedAmmo(){
    let dataset = ammo_dataset.filterByString($("#ammoSelect").val(), "Alias");
    let import_string = dataset.getFirstCellByTitle("Damage") + "," +
                        dataset.getFirstCellByTitle("Rate of fire") + "," +
                        dataset.getFirstCellByTitle("Clip size") + "," +
                        dataset.getFirstCellByTitle("Direct damage") + "," +
                        dataset.getFirstCellByTitle("AOE damage") + "," +
                        dataset.getFirstCellByTitle("Projectile speed") + "," +
                        dataset.getFirstCellByTitle("Arming time") + "," +
                        dataset.getFirstCellByTitle("Range") + "," +
                        dataset.getFirstCellByTitle("Jitter") + "," +
                        dataset.getFirstCellByTitle("AOE radius") + "," +
                        dataset.getFirstCellByTitle("Rotation speed") + "," +
                        dataset.getFirstCellByTitle("Rotational arcs") + "," +
                        dataset.getFirstCellByTitle("Fire modifier") + "," +
                        dataset.getFirstCellByTitle("Fire damage");
    import_string = btoa(import_string);
    importCustomAmmo(import_string);
    
}


function getGunNumbers(gun_type, ammo_type, buffed) {

    if (!buffed)
        buffed = $("#buffedCheckbox").is(':checked');
    if (!gun_type)
        gun_type = $("#gunSelect").val();
    if (!ammo_type)
        ammo_type = $("#ammoSelect").val();


    



    let gun_data = gun_dataset.filterByString(gun_type, "Alias").getDatasetRow(0);

    let ammo_data;
    if ($("#damageCalcCustomAmmoCheck").is(':checked')){
        ammo_data = [
            "Custom",
            "Custom",
            $("#customAmmoInputArmingRotationSpeed").val(),
            $("#customAmmoInputArmingJitter").val(),
            $("#customAmmoInputClipSize").val(),
            $("#customAmmoInputAoERadius").val(),
            $("#customAmmoInputAoEDamage").val(),
            $("#customAmmoInputDamage").val(),
            $("#customAmmoInputArmingTime").val(),
            $("#customAmmoInputROF").val(),
            $("#customAmmoInputSpeed").val(),
            $("#customAmmoInputArmingRotationalFireChance").val(),
            $("#customAmmoInputArmingRotationalFireDamage").val(),
            1,
            $("#customAmmoInputDirectDmg").val(),
            $("#customAmmoInputRange").val(),
            $("#customAmmoInputArmingRotationalArcs").val()
        ];
    }
    else
        ammo_data = ammo_dataset.filterByString(ammo_type, "Alias").getDatasetRow(0);

    // Damage unit scales
    let unit_dict = {
        "HP": 1,
        "Mallets": tool_dataset.getCellByString("Mallet", "Name", "Repair"),
        "Galleon A.": ship_dataset.getCellByString("Galleon", "Ship Type", "Armor"),
        "Pyramidion A.": ship_dataset.getCellByString("Pyramidion", "Ship Type", "Armor"),
        "Stormbreaker A.": ship_dataset.getCellByString("Stormbreaker", "Ship Type", "Armor"),
        "Galleon H.": ship_dataset.getCellByString("Galleon", "Ship Type", "Hull Health"),
        "Pyramidion H.": ship_dataset.getCellByString("Pyramidion", "Ship Type", "Hull Health"),
        "Stormbreaker H.": ship_dataset.getCellByString("Stormbreaker", "Ship Type", "Hull Health"),
        "B. Mallets": (tool_dataset.getCellByString("Mallet", "Name", "Repair") / 0.76),
        "Balloons": component_dataset.getCellByString("Balloon", "Name", "HP"),
        "Light Guns": component_dataset.getCellByString("Light Gun", "Name", "HP"),
        "Heavy Guns": component_dataset.getCellByString("Heavy Gun", "Name", "HP"),
        "Light Engines": component_dataset.getCellByString("Light Engine", "Name", "HP"),
        "Heavy Engines": component_dataset.getCellByString("Heavy Engine", "Name", "HP")
    };
    let armor_unit_scale = 1 / unit_dict[$("#armorUnitSelect").val()];
    let hull_unit_scale = 1 / unit_dict[$("#hullUnitSelect").val()];
    let balloon_unit_scale = 1 / unit_dict[$("#balloonUnitSelect").val()];
    let component_unit_scale = 1 / unit_dict[$("#componentUnitSelect").val()];

    // Calculate gun stats

    let gun_d = {
        "weapon slot": gun_data[2],
        "primary dmg type": gun_data[3],
        "primary dmg": parseFloat(gun_data[4]),
        "secondary dmg type": gun_data[5],
        "secondary dmg": parseFloat(gun_data[6]),
        "RoF": parseFloat(gun_data[7]),
        "reload time": parseFloat(gun_data[8]),
        "clip size": parseFloat(gun_data[9]),
        "fire primary": parseFloat(gun_data[10]),
        "fire secondary": parseFloat(gun_data[11]),
        "proectile speed": parseFloat(gun_data[12]),
        "range": parseFloat(gun_data[13]),
        "shell drop": parseFloat(gun_data[14]),
        "AoE radius": parseFloat(gun_data[15]),
        "buckshot": parseFloat(gun_data[16]),
        "arming time": parseFloat(gun_data[17]),
        "side angle": parseFloat(gun_data[18]),
        "up angle": parseFloat(gun_data[19]),
        "down angle": parseFloat(gun_data[20]),
    };


    let ammo_d = {
        "rotation speed": parseFloat(ammo_data[2]),
        "jitter": parseFloat(ammo_data[3]),
        "clip size": parseFloat(ammo_data[4]),
        "AoE radius": parseFloat(ammo_data[5]),
        "AoE damage": parseFloat(ammo_data[6]),
        "damage": parseFloat(ammo_data[7]),
        "arming time": parseFloat(ammo_data[8]),
        "RoF": parseFloat(ammo_data[9]),
        "projectile speed": parseFloat(ammo_data[10]),
        "fire mod": parseFloat(ammo_data[11]),
        "fire dmg": parseFloat(ammo_data[12]),
        "lift": parseFloat(ammo_data[13]),
        "direct damage": parseFloat(ammo_data[14]),
        "range": parseFloat(ammo_data[15]),
        "rot arcs": parseFloat(ammo_data[16])
    };

    let clip_size = Math.max(1, Math.round(gun_d["clip size"] * ammo_d["clip size"]));
    let rate_of_fire = gun_d["RoF"] * ammo_d["RoF"];

    let range = gun_d["range"] * ammo_d["projectile speed"] * ammo_d["range"];
    let arming_distance = gun_d["arming time"] * gun_d["proectile speed"] * ammo_d["arming time"] * ammo_d["projectile speed"];
    let seconds_clip = Math.max((clip_size - 1) / rate_of_fire, 1); // Seconds per clip never below 1 
    let aoe = gun_d["AoE radius"] * ammo_d["AoE radius"];

    let angle = gun_d["side angle"] * ammo_d["rot arcs"];

    let damage_dict = {};
    let info_dict = {
        "range": range, 
        "arming distance": arming_distance, 
        "seconds per clip": seconds_clip, 
        "clip size": clip_size, 
        "aoe": aoe,
        "angle": angle
    };


    let damage_type_primary = gun_d["primary dmg type"];
    let damage_type_secondary = gun_d["secondary dmg type"];

    let damage_hit_primary = gun_d["primary dmg"] * ammo_d["damage"] * ammo_d["direct damage"] * (buffed ? 1.1 : 1);
    let damage_hit_secondary = gun_d["secondary dmg"] * ammo_d["damage"] * ammo_d["AoE damage"] * (buffed ? 1.1 : 1);
    
    // Aten Lens special case
    if (gun_type == "Aten Lens Array"){
        special_info = "laser";

        // Laser dont shoot for first 1.75 seconds
        seconds_clip += 1;

        // Calculate damage done in X seconds

        let shooting_time = parseFloat($("#timeRange").val());
        let target_distance = parseFloat($("#distanceRange").val());
        info_dict["shooting time"] = shooting_time;
        let damage_X_mod = laserAvgDamage(gun_d, ammo_d, target_distance, shooting_time);
        let shots_per_X = Math.floor(shooting_time * rate_of_fire);
        let damage_X_primary = damage_hit_primary * shots_per_X * damage_X_mod;
        let damage_X_secondary = damage_hit_secondary * shots_per_X * damage_X_mod;
        
        // console.log("Shots per X: ", shots_per_X);
        // console.log("damage_X_mod: ", damage_X_mod);
        // console.log("Shots per X: ", shots_per_X);

        damage_dict["per X seconds"] = {};
        damage_dict["per X seconds"]["armor"] = armor_unit_scale * (damage_X_primary * getDamageMod(damage_type_primary, "Armor") + damage_X_secondary * getDamageMod(damage_type_secondary, "Armor"));
        damage_dict["per X seconds"]["hull"] = hull_unit_scale * (damage_X_primary * getDamageMod(damage_type_primary, "Hull") + damage_X_secondary * getDamageMod(damage_type_secondary, "Hull"));
        damage_dict["per X seconds"]["balloon"] = balloon_unit_scale * (damage_X_primary * getDamageMod(damage_type_primary, "Balloon") + damage_X_secondary * getDamageMod(damage_type_secondary, "Balloon"));
        damage_dict["per X seconds"]["component"] = component_unit_scale * (damage_X_primary * getDamageMod(damage_type_primary, "Components") + damage_X_secondary * getDamageMod(damage_type_secondary, "Components"));
        

        // Scale damage for later calculations
        let laser_damage_modifier = laserAvgDamage(gun_d, ammo_d, target_distance, seconds_clip);
        damage_hit_primary *= laser_damage_modifier;
        damage_hit_secondary *= laser_damage_modifier;
    }

    if (gun_type == "Mine"){
        range = arming_distance + 50;
        info_dict["range"] = range;
    }
    // TODO tempest special case

    let damage_clip_primary = damage_hit_primary * clip_size;
    let damage_clip_secondary = damage_hit_secondary * clip_size;

    let damage_second_1_primary = damage_clip_primary / seconds_clip;
    let damage_second_1_secondary = damage_clip_secondary / seconds_clip;

    let damage_second_2_primary = damage_clip_primary / (seconds_clip + gun_d["reload time"] * (buffed ? 0.9 : 1));
    let damage_second_2_secondary = damage_clip_secondary / (seconds_clip + gun_d["reload time"] * (buffed ? 0.9 : 1));

    // Calculate damages

    // Damage / shot
    damage_dict["per shot"] = {};
    damage_dict["per shot"]["armor"] = armor_unit_scale * (damage_hit_primary * getDamageMod(damage_type_primary, "Armor") + damage_hit_secondary * getDamageMod(damage_type_secondary, "Armor"));
    damage_dict["per shot"]["hull"] = hull_unit_scale * (damage_hit_primary * getDamageMod(damage_type_primary, "Hull") + damage_hit_secondary * getDamageMod(damage_type_secondary, "Hull"));
    damage_dict["per shot"]["balloon"] = balloon_unit_scale * (damage_hit_primary * getDamageMod(damage_type_primary, "Balloon") + damage_hit_secondary * getDamageMod(damage_type_secondary, "Balloon"));
    damage_dict["per shot"]["component"] = component_unit_scale * (damage_hit_primary * getDamageMod(damage_type_primary, "Components") + damage_hit_secondary * getDamageMod(damage_type_secondary, "Components"));

    // Damage / clip
    damage_dict["per clip"] = {};
    damage_dict["per clip"]["armor"] = armor_unit_scale * (damage_clip_primary * getDamageMod(damage_type_primary, "Armor") + damage_clip_secondary * getDamageMod(damage_type_secondary, "Armor"));
    damage_dict["per clip"]["hull"] = hull_unit_scale * (damage_clip_primary * getDamageMod(damage_type_primary, "Hull") + damage_clip_secondary * getDamageMod(damage_type_secondary, "Hull"));
    damage_dict["per clip"]["balloon"] = balloon_unit_scale * (damage_clip_primary * getDamageMod(damage_type_primary, "Balloon") + damage_clip_secondary * getDamageMod(damage_type_secondary, "Balloon"));
    damage_dict["per clip"]["component"] = component_unit_scale * (damage_clip_primary * getDamageMod(damage_type_primary, "Components") + damage_clip_secondary * getDamageMod(damage_type_secondary, "Components"));

    // Damage / second (one clip)'
    damage_dict["per second"] = {};
    damage_dict["per second"]["armor"] = armor_unit_scale * (damage_second_1_primary * getDamageMod(damage_type_primary, "Armor") + damage_second_1_secondary * getDamageMod(damage_type_secondary, "Armor"));
    damage_dict["per second"]["hull"] = hull_unit_scale * (damage_second_1_primary * getDamageMod(damage_type_primary, "Hull") + damage_second_1_secondary * getDamageMod(damage_type_secondary, "Hull"));
    damage_dict["per second"]["balloon"] = balloon_unit_scale * (damage_second_1_primary * getDamageMod(damage_type_primary, "Balloon") + damage_second_1_secondary * getDamageMod(damage_type_secondary, "Balloon"));
    damage_dict["per second"]["component"] = component_unit_scale * (damage_second_1_primary * getDamageMod(damage_type_primary, "Components") + damage_second_1_secondary * getDamageMod(damage_type_secondary, "Components"));

    // Damage / second (with reloading)
    damage_dict["per second reload"] = {};
    damage_dict["per second reload"]["armor"] = armor_unit_scale * (damage_second_2_primary * getDamageMod(damage_type_primary, "Armor") + damage_second_2_secondary * getDamageMod(damage_type_secondary, "Armor"));
    damage_dict["per second reload"]["hull"] = hull_unit_scale * (damage_second_2_primary * getDamageMod(damage_type_primary, "Hull") + damage_second_2_secondary * getDamageMod(damage_type_secondary, "Hull"));
    damage_dict["per second reload"]["balloon"] = balloon_unit_scale * (damage_second_2_primary * getDamageMod(damage_type_primary, "Balloon") + damage_second_2_secondary * getDamageMod(damage_type_secondary, "Balloon"));
    damage_dict["per second reload"]["component"] = component_unit_scale * (damage_second_2_primary * getDamageMod(damage_type_primary, "Components") + damage_second_2_secondary * getDamageMod(damage_type_secondary, "Components"));

    // Fire / clip
    let fire_clip_primary = gun_d["fire primary"] * clip_size * ammo_d["fire mod"];
    let fire_clip_secondary = gun_d["fire secondary"] * clip_size * ammo_d["fire mod"];

    let fire_clip_armor_primary = fire_clip_primary + ammo_d["fire dmg"] * damage_clip_primary * getDamageMod(damage_type_primary, "Armor");
    let fire_clip_armor_secondary = fire_clip_secondary + ammo_d["fire dmg"] * damage_clip_secondary * getDamageMod(damage_type_secondary, "Armor");
    let fire_clip_balloon_primary = fire_clip_primary + ammo_d["fire dmg"] * damage_clip_primary * getDamageMod(damage_type_primary, "Balloon");
    let fire_clip_balloon_secondary = fire_clip_secondary + ammo_d["fire dmg"] * damage_clip_secondary * getDamageMod(damage_type_secondary, "Balloon");
    let fire_clip_component_primary = fire_clip_primary + ammo_d["fire dmg"] * damage_clip_primary * getDamageMod(damage_type_primary, "Components");
    let fire_clip_component_secondary = fire_clip_secondary + ammo_d["fire dmg"] * damage_clip_secondary * getDamageMod(damage_type_secondary, "Components");

    damage_dict["fire"] = {};
    damage_dict["fire"]["armor"] = fire_clip_armor_primary + fire_clip_armor_secondary;
    damage_dict["fire"]["hull"] = 0;
    damage_dict["fire"]["balloon"] = fire_clip_balloon_primary + fire_clip_balloon_secondary;
    damage_dict["fire"]["component"] = fire_clip_component_primary + fire_clip_component_secondary;

    return {"damage": damage_dict, "info": info_dict};
}

function updateGunInfoTable() {
    if (!(gun_dataset && ammo_dataset && damage_dataset && tool_dataset && component_dataset && ship_dataset)) {
        console.log("Still loading");
        setTimeout(function(){ updateGunInfoTable(); }, 1000);
        return;
    }

    // get gun data
    let gun_numbers = getGunNumbers();

    // Hide/show laser ui
    let laser_div = $("#laserExtras");
    $("#gunSelect").val() == "Aten Lens Array" ? laser_div.show() : laser_div.hide();
    if ($("#gunSelect").val() == "Aten Lens Array"){
        let dist_range = $("#distanceRange");
        let time_range = $("#timeRange");

        dist_range.prop("max", gun_numbers.info.range);
        time_range.prop("max", gun_numbers.info["seconds per clip"]);

        $("#distanceText").val(dist_range.val());
        $("#timeText").val(parseFloat(time_range.val()).toFixed(1));
    }

    // Fill out UI

    let gunTableContents = $(`
        <tr>
          <td>` + precise(gun_numbers.info["range"], 3) + `</td>
          <td>` + precise(gun_numbers.info["arming distance"], 3) + `</td>
          <td>` + precise(gun_numbers.info["seconds per clip"], 2) + `</td>
          <td>` + gun_numbers.info["clip size"] + `</td>
          <td>` + precise(gun_numbers.info["aoe"], 3) + `</td>
        </tr>`);
    $("#gunContent").empty();
    $("#gunContent").append(gunTableContents);

    let damageTableContents = $(`
        <tr>` + 
        (!gun_numbers.damage.hasOwnProperty("per X seconds") ? 
        "" :  
        `<tr>
          <th>Damage in `+gun_numbers.info["shooting time"]+` seconds</th>
          <td>` + precise(gun_numbers.damage["per X seconds"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per X seconds"]["hull"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per X seconds"]["balloon"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per X seconds"]["component"], 3) + `</td>
        </tr>`) + 
        `
          <th>Damage / shot</th>
          <td>` + precise(gun_numbers.damage["per shot"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per shot"]["hull"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per shot"]["balloon"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per shot"]["component"], 3) + `</td>
        </tr><tr>
          <th>Damage / second (one clip)</th>
          <td>` + precise(gun_numbers.damage["per second"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second"]["hull"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second"]["balloon"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second"]["component"], 3) + `</td>
        </tr>
        <tr>
          <th>Damage / second (with reloading)</th>
          <td>` + precise(gun_numbers.damage["per second reload"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second reload"]["hull"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second reload"]["balloon"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per second reload"]["component"], 3) + `</td>
        </tr>
        <tr>
          <th>Damage / clip</th>
          <td>` + precise(gun_numbers.damage["per clip"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per clip"]["hull"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per clip"]["balloon"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["per clip"]["component"], 3) + `</td>
        </tr>
        <tr>
          <th>Fire / clip (avg.)</th>
          <td>` + precise(gun_numbers.damage["fire"]["armor"], 3) + `</td>
          <td>` + "-" + `</td>
          <td>` + precise(gun_numbers.damage["fire"]["armor"], 3) + `</td>
          <td>` + precise(gun_numbers.damage["fire"]["component"], 3) + `</td>
        </tr>
    `);
    $("#damageTableContent").empty();
    $("#damageTableContent").append(damageTableContents);

}
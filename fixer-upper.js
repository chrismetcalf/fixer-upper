function zillowReady(selector) {
  var dfd = new jQuery.Deferred();

  // Check the state of our victim
  var timer = setInterval(function() {
    if($(selector).hasClass("loading")) {
      // We keep waiting
      dfd.notify("waiting...");
    } else {
      // We're done
      clearInterval(timer);
      dfd.resolve("done");
    }
  }, 500);

  return dfd.promise();
}

$(document).ready(function() {
  var address = $('meta[property="og:zillow_fb:address"]').attr("content").toUpperCase().split(", ")[0];
  $.getJSON("https://zillow.demo.socrata.com/resource/m393-mbxq.json?originaladdress1=" 
    + address, function(data) {
      // OK, we found some permits, let's wait until we're actually ready...
      $.when(zillowReady("#hdp-tax-history")).then(
        function(status) {
          // Take our victim and update some stuff
          var block = $("#hdp-tax-history").clone();
          block.find("h2").text("Building Permits");
          block.find("p").html('Find more information about building permits by viewing the <a href="http://zillow.demo.socrata.com/d/m393-mbxq">source dataset</a>.');

          // Blow away the table contents and then add our own header
          block.find("table tr").remove();
          block.find("table").append("<tr><th>Permit #</th><th>Type</th><th>Sub-Type</th></tr>");

          // Use the template to add some new rows in
          $.each(data, function(idx, permit) {
            var row = $("<tr>");
            row.append('<td><a target="_blank" href="' + permit.link + '">' + permit.permitnum + '</a></td>');
            row.append('<td>' + permit.permittype + '</td>');
            row.append('<td>' + permit.work_type_extra + '</td>');
            block.find('table').append(row);
          });

          $("#hdp-tax-history").append(block);
        },
        null,
        function(status) {
          console.log("Waiting? " + status);
        }
      );
    }
  );
});


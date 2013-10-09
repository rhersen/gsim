function init() {
  $("#left").resizable({
    handles: 'e',
    minWidth: '50',
    maxWidth: '350'
  });

  jQuery(document).ready(function(){
    $('.expandable .head').click(function() {
        $(this).next().toggle('fast');
        return false;
    });
  });
}

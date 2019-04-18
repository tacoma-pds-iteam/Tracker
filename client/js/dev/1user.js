/* This file holds constants for client to lookup icon and standard comments based on the department parameter */

/* constant contains the html strings for all department icons used in Tracker */
const icons = {
  'Reception': '<i class="fa fa-user reception-icon" aria-hidden="true" title="Reception"></i>',
  'Real Property Review': '<i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i>',
  'Building Residential Review': '<i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i>',
  'Building Commercial Review': '<i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i>',
  'Site Development Review': '<i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i>',
  'Land Use Review': '<i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i>',
  'Fire Protection Review': '<i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i>',
  'Traffic Review': '<i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i>',
  'Historic Review': '<i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i>',
  'Permit Specialist': '<i class="fa fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i>',
  'Application Services Review': '<i class="fas fa-id-card-alt" title="Application Services"></i>',
  'Inspections': '<i class="fa fa-eye inspections-icon" aria-hidden="true" title="Inspection"></i>',
  'Unknown': '<i class="fa fa-question-circle unknown-icon" aria-hidden="true" title="Unknown"></i>',
  'wait': '<i class="far fa-clock waiting-icon" aria-hidden="true" title="Waiting For"></i>',
  'with': '<i class="far fa-handshake with-icon" aria-hidden="true" title="Currently With"></i>',
  'Time After WF Closed': '<i class="far fa-question-circle unknown-icon" aria-hidden="true" title="Unknown"></i>'
};
/* constant contains all standard comments used by each department in Tracker */
const standardComments = {
  'Real Property Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Residential Building Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Commercial Building Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Site Development Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Land Use Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Fire Protection Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Traffic Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Historic Review': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Permit Specialist': [
    'Permit paid for and obtained; customer ready for departure',
    'Fees waived and obtained; customer ready for departure',
    'No permit obtained; customer ready for departure',
    'Additional questions for Real Property',
    'Additional questions for Building',
    'Additional questions for Site',
    'Additional questions for Land Use',
    'Additional questions for Fire',
    'Additional questions for Traffic',
    'Additional questions for Historic'
  ],
  'Reception': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Application Services': [
    'Ready for Permit Specialist',
    'Sending back to Reception',
    'Ready for departure'
  ],
  'Admin': [
    'I know it all. No need for comments',
    'Go away'
  ]

};
/* Function escapes special characters from a string that cant be pushed to Accela */
const escapeSpecialChars = un => {
  return un.replace(/\n/g, '. ')
          .replace(/\'/g, '\\\'')
          .replace(/\&/g, '')
          .replace(/\r/g, '')
          .replace(/\t/g, '    ')
          .replace(/\b/g, '')
          .replace(/\f/g, '');
}
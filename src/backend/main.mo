import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    id : Principal;
    name : Text;
    registrationDate : Int;
    licenseCode : Text;
    licenseStart : Int;
    licenseExpiry : Int;
    licenseStatus : Text;
    isAdmin : Bool;
  };

  type License = {
    code : Text;
    assignedPhone : Text;
    clientName : Text;
    activationDate : Int;
    expiryDate : Int;
    status : Text;
  };

  type SOSAlert = {
    id : Text;
    userId : Principal;
    userName : Text;
    lat : Float;
    lng : Float;
    activatedAt : Int;
    lastLocationUpdate : Int;
    status : Text;
    neighborhood : Text;
  };

  type Incident = {
    id : Text;
    userId : Principal;
    userName : Text;
    incidentType : Text;
    description : Text;
    lat : Float;
    lng : Float;
    neighborhood : Text;
    createdAt : Int;
    confirmations : Nat;
    falseReports : Nat;
    status : Text;
    adminValidated : Bool;
  };

  type LocationShare = {
    id : Text;
    ownerId : Principal;
    ownerName : Text;
    lat : Float;
    lng : Float;
    lastUpdate : Int;
    isActive : Bool;
    shareLink : Text;
    description : ?Text;
  };

  type Metrics = {
    totalUsers : Nat;
    activeLicenses : Nat;
    expiredLicenses : Nat;
    totalSOSCount : Nat;
    activeSOSCount : Nat;
    totalIncidents : Nat;
  };

  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      switch (Text.compare(user1.name, user2.name)) {
        case (#equal) { Principal.compare(user1.id, user2.id) };
        case (order) { order };
      };
    };

    public func compareById(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      Principal.compare(user1.id, user2.id);
    };
  };

  module License {
    public func compare(license1 : License, license2 : License) : Order.Order {
      Text.compare(license1.code, license2.code);
    };

    public func compareByExpiry(license1 : License, license2 : License) : Order.Order {
      Int.compare(license1.expiryDate, license2.expiryDate);
    };
  };

  module SOSAlert {
    public func compare(sos1 : SOSAlert, sos2 : SOSAlert) : Order.Order {
      Principal.compare(sos1.userId, sos2.userId);
    };

    public func compareByActivation(sos1 : SOSAlert, sos2 : SOSAlert) : Order.Order {
      Int.compare(sos1.activatedAt, sos2.activatedAt);
    };
  };

  module Incident {
    public func compare(inc1 : Incident, inc2 : Incident) : Order.Order {
      Principal.compare(inc1.userId, inc2.userId);
    };
  };

  module LocationShare {
    public func compare(loc1 : LocationShare, loc2 : LocationShare) : Order.Order {
      Principal.compare(loc1.ownerId, loc2.ownerId);
    };
  };

  let users = Map.empty<Principal, UserProfile>();
  let licenses = Map.empty<Text, License>();
  let sosAlerts = Map.empty<Text, SOSAlert>();
  let incidents = Map.empty<Text, Incident>();
  let locationShares = Map.empty<Text, LocationShare>();

  public shared ({ caller }) func registerUser(name : Text, phone : Text, neighborhood : Text, licenseCode : Text) : async () {
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };

    let userProfile : UserProfile = {
      id = caller;
      name;
      registrationDate = Time.now();
      licenseCode;
      licenseStart = 0;
      licenseExpiry = 0;
      licenseStatus = "pending";
      isAdmin = false;
    };

    users.add(caller, userProfile);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.id != caller) {
      Runtime.trap("Cannot save profile for another user");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUser(userId : Principal) : async ?UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    users.get(userId);
  };

  public query ({ caller }) func listAllUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func blockUser(userId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let existing = users.get(userId);
    switch (existing) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        let updated = {
          user with
          licenseStatus = "blocked";
        };
        users.add(userId, updated);
      };
    };
  };

  public shared ({ caller }) func unblockUser(userId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let existing = users.get(userId);
    switch (existing) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        let updated = {
          user with
          licenseStatus = "active";
        };
        users.add(userId, updated);
      };
    };
  };

  public shared ({ caller }) func createLicense(code : Text, clientName : Text, phone : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    if (licenses.containsKey(code)) { Runtime.trap("License already exists") };

    let license : License = {
      code;
      assignedPhone = phone;
      clientName;
      activationDate = 0;
      expiryDate = 0;
      status = "pending";
    };

    licenses.add(code, license);
  };

  public shared ({ caller }) func activateLicense(code : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let existing = licenses.get(code);
    switch (existing) {
      case (null) { Runtime.trap("License does not exist") };
      case (?license) {
        let updated = {
          license with
          activationDate = Time.now();
          expiryDate = Time.now() + 90 * 24 * 3600 * 1_000_000_000;
          status = "active";
        };
        licenses.add(code, updated);
      };
    };
  };

  public shared ({ caller }) func renewLicense(code : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let license = licenses.get(code);
    switch (license) {
      case (null) { Runtime.trap("License not found") };
      case (?lic) {
        let newExpiry = Time.now() + 90 * 24 * 3600 * 1_000_000_000;

        let updated = {
          lic with
          expiryDate = newExpiry;
          status = "active";
        };
        licenses.add(code, updated);
      };
    };
  };

  public shared ({ caller }) func blockLicense(code : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let existing = licenses.get(code);
    switch (existing) {
      case (null) { Runtime.trap("License does not exist") };
      case (?license) {
        let updated = {
          license with
          status = "blocked";
        };
        licenses.add(code, updated);
      };
    };
  };

  public query ({ caller }) func listAllLicenses() : async [License] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    licenses.values().toArray();
  };

  public query ({ caller }) func checkLicenseValidity(code : Text) : async Text {
    let license = licenses.get(code);
    switch (license) {
      case (null) { Runtime.trap("License not found") };
      case (?lic) { lic.status };
    };
  };

  public shared ({ caller }) func createSOS(userName : Text, lat : Float, lng : Float, neighborhood : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create SOS alerts");
    };

    let id = (Time.now() * 100_000_000).toText();

    let sos : SOSAlert = {
      id;
      userId = caller;
      userName;
      lat;
      lng;
      activatedAt = Time.now();
      lastLocationUpdate = Time.now();
      status = "active";
      neighborhood;
    };

    sosAlerts.add(id, sos);
    id;
  };

  public shared ({ caller }) func updateSOSLocation(id : Text, lat : Float, lng : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update SOS alerts");
    };

    let existing = sosAlerts.get(id);
    switch (existing) {
      case (null) { Runtime.trap("SOS not found") };
      case (?sos) {
        if (sos.userId != caller) { Runtime.trap("Unauthorized: Can only update own SOS") };

        let updated = {
          sos with
          lat;
          lng;
          lastLocationUpdate = Time.now();
        };
        sosAlerts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func resolveSOS(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve SOS alerts");
    };

    let existing = sosAlerts.get(id);
    switch (existing) {
      case (null) { Runtime.trap("SOS not found") };
      case (?sos) {
        if (sos.userId != caller) { Runtime.trap("Unauthorized: Can only resolve own SOS") };

        let updated = {
          sos with
          status = "resolved";
        };
        sosAlerts.add(id, updated);
      };
    };
  };

  public query ({ caller }) func listActiveSOSAlerts() : async [SOSAlert] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    sosAlerts.values().filter(func(sos) { sos.status == "active" }).toArray();
  };

  public query ({ caller }) func getSOSById(id : Text) : async SOSAlert {
    let sos = sosAlerts.get(id);
    switch (sos) {
      case (null) { Runtime.trap("SOS not found") };
      case (?sos) {
        if (sos.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view own SOS or admin access required");
        };
        sos;
      };
    };
  };

  public shared ({ caller }) func createIncident(userName : Text, incidentType : Text, description : Text, lat : Float, lng : Float, neighborhood : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create incidents");
    };

    let id = (Time.now() * 100_000_000).toText();

    let incident : Incident = {
      id;
      userId = caller;
      userName;
      incidentType;
      description;
      lat;
      lng;
      neighborhood;
      createdAt = Time.now();
      confirmations = 0;
      falseReports = 0;
      status = "pending";
      adminValidated = false;
    };

    incidents.add(id, incident);
    id;
  };

  public shared ({ caller }) func confirmIncident(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm incidents");
    };

    let incident = incidents.get(id);
    switch (incident) {
      case (null) { Runtime.trap("Incident not found") };
      case (?inc) {
        let updated = {
          inc with
          confirmations = inc.confirmations + 1;
        };
        incidents.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func flagFalseIncident(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can flag incidents");
    };

    let incident = incidents.get(id);
    switch (incident) {
      case (null) { Runtime.trap("Incident not found") };
      case (?inc) {
        let updated = {
          inc with
          falseReports = inc.falseReports + 1;
        };
        incidents.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func validateIncident(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let incident = incidents.get(id);
    switch (incident) {
      case (null) { Runtime.trap("Incident not found") };
      case (?inc) {
        let updated = {
          inc with
          status = "validated";
          adminValidated = true;
        };
        incidents.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func removeIncident(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Admins only") };

    let incident = incidents.get(id);
    switch (incident) {
      case (null) { Runtime.trap("Incident not found") };
      case (?inc) {
        let updated = {
          inc with
          status = "false";
          adminValidated = true;
        };
        incidents.add(id, updated);
      };
    };
  };

  public query ({ caller }) func listIncidents(incidentType : ?Text) : async [Incident] {
    let allIncidents = incidents.values();
    switch (incidentType) {
      case (?iType) {
        allIncidents.filter(func(inc) { inc.incidentType == iType }).toArray();
      };
      case null {
        allIncidents.toArray();
      };
    };
  };

  public query ({ caller }) func getIncidentById(id : Text) : async Incident {
    let incident = incidents.get(id);
    switch (incident) {
      case (null) { Runtime.trap("Incident not found") };
      case (?inc) { inc };
    };
  };

  public shared ({ caller }) func createLocationShare(ownerName : Text, lat : Float, lng : Float, shareLink : Text, description : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create location shares");
    };

    let id = (Time.now() * 100_000_000).toText();

    let loc : LocationShare = {
      id;
      ownerId = caller;
      ownerName;
      lat;
      lng;
      lastUpdate = Time.now();
      isActive = true;
      shareLink;
      description;
    };

    locationShares.add(id, loc);
    id;
  };

  public shared ({ caller }) func updateLocationShare(id : Text, lat : Float, lng : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update location shares");
    };

    let existing = locationShares.get(id);
    switch (existing) {
      case (null) { Runtime.trap("Location share not found") };
      case (?loc) {
        if (loc.ownerId != caller) { Runtime.trap("Unauthorized: Can only update own location share") };

        let updated = {
          loc with
          lat;
          lng;
          lastUpdate = Time.now();
        };
        locationShares.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deactivateLocationShare(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deactivate location shares");
    };

    let existing = locationShares.get(id);
    switch (existing) {
      case (null) { Runtime.trap("Location share not found") };
      case (?loc) {
        if (loc.ownerId != caller) { Runtime.trap("Unauthorized: Can only deactivate own location share") };

        let updated = {
          loc with
          isActive = false;
        };
        locationShares.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getLocationShare(id : Text) : async LocationShare {
    let loc = locationShares.get(id);
    switch (loc) {
      case (null) { Runtime.trap("Location share not found") };
      case (?loc) {
        if (not loc.isActive) { Runtime.trap("Location share is not active") };
        loc;
      };
    };
  };

  public query ({ caller }) func listOwnActiveShareSessions() : async [LocationShare] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list their location shares");
    };

    locationShares.values().filter(
      func(loc) {
        loc.ownerId == caller and loc.isActive;
      }
    ).toArray();
  };

  public query ({ caller }) func getMetrics() : async Metrics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    let now = Time.now();
    let activeLicenses = licenses.values().toArray().filter(
      func(lic) { lic.expiryDate > now }
    ).size();
    let expiredLicenses = licenses.values().toArray().filter(
      func(lic) { lic.expiryDate <= now }
    ).size();
    let activeSOSCount = sosAlerts.values().toArray().filter(
      func(sos) { sos.status == "active" }
    ).size();

    {
      totalUsers = users.size();
      activeLicenses;
      expiredLicenses;
      totalSOSCount = sosAlerts.size();
      activeSOSCount;
      totalIncidents = incidents.size();
    };
  };

  public shared ({ caller }) func setAdmin() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only existing admins can assign admin role");
    };

    let user = users.get(caller);
    switch (user) {
      case (null) { () };
      case (?user) {
        let updated = {
          user with
          isAdmin = true;
        };
        users.add(caller, updated);
      };
    };
  };
};

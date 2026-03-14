import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    id : Principal;
    name : Text;
    registrationDate : Int;
    licenseCode : Text;
    licenseStart : Int;
    licenseExpiry : Int;
    licenseStatus : Text;
    isAdmin : Bool;
  };

  type OldActor = {
    users : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    id : Principal;
    name : Text;
    registrationDate : Int;
    licenseCode : Text;
    licenseStart : Int;
    licenseExpiry : Int;
    licenseStatus : Text;
    isAdmin : Bool;
    phone : Text;
    neighborhood : Text;
    isBlocked : Bool;
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldUser) {
        {
          oldUser with
          phone = "N/A";
          neighborhood = "N/A";
          isBlocked = false;
        };
      }
    );
    { old with users = newUsers };
  };
};

Vue.component('joke-userinfo', {
    props: {
        joke: Object,
        jokeid: String,
        userid: String
    },
    data: function () {
      return {
          smileEntered: false,
          punchlineEntered: false
      }
    },
    methods: {
        addSmile: function() {
            //if(!this.smileEntered) {
                this.joke.Smiles++;
                var jokeRef = firebase.firestore().collection("usercontent").doc(this.jokeid);
                jokeRef.update({
                    Smiles: firebase.firestore.FieldValue.increment(1)
                });
                this.smileEntered = true;
            //}
        },
        addPunchline: function() {
            var newPunchline = {
                UserId: this.userid,
                Timestamp: (new Date()).toISOString(),
                Smiles: 0,
                Punchline: $("#punchlinetext").val()
            };

            var uniqueId =  Math.random().toString(36).substring(2) + Date.now().toString(36);
            var newDoc = '{ "UserPunchlines.'+ uniqueId + '": ' + JSON.stringify(newPunchline) + '}';
            firebase.firestore().collection('usercontent').doc(this.jokeid).update(
                JSON.parse(newDoc)
            );

            this.joke.UserPunchlines[uniqueId] = newPunchline;  
            this.$forceUpdate(); 
            $("#punchlinetext").val("");
        },
        addPunchlineSmile: function(id) {
            this.joke.UserPunchlines[id].Smiles++;

            var jokeRef = firebase.firestore().collection("usercontent").doc(this.jokeid);
            var updateDoc = {};
            updateDoc["UserPunchlines." + id + ".Smiles"] = firebase.firestore.FieldValue.increment(1);
            jokeRef.update(updateDoc);   
            this.$forceUpdate();          
        }
    },
    template: ` <div class="container">
                    <div class="row">
                        <div v-on:click="addSmile()" class="col-12">
                            <i class="material-icons" style="font-size: 48px; cursor: pointer; user-select: none;">insert_emoticon</i>
                            <span style="position: relative; bottom: 19px;">{{joke.Smiles}} Smiles </span>
                        </div>
                        <div class="col-12">
                            <h3 onclick="$('#user-punchlines').toggle()" style="cursor: pointer;">☟ User Submitted Punchlines ☟</h3>
                            <div id="user-punchlines" style="display: none" class="row">
                                <div v-for="(punchline, id) in joke.UserPunchlines" class="col-4">
                                    <div class="row">
                                        <div class="col-auto" v-on:click="addPunchlineSmile(id)" style="text-align: left">
                                            <i class="material-icons" style="font-size: 34px; cursor: pointer; user-select: none;">insert_emoticon</i>
                                            <span style="position: relative; bottom: 13px;">{{punchline.Smiles}} </span>
                                        </div>
                                        <div class="col" style="text-align: left; position: relative; top: 3px;">{{punchline.Punchline}}</div>
                                    </div>
                                </div>   
                                <div class="col-12">
                                    <h5>Add Your Punchline:</h5>
                                    <textarea id="punchlinetext"></textarea><br>
                                    <button id="submitpunchline" class="btn btn-primary" v-on:click="addPunchline()">Submit</button>
                                </div> 
                            </div>                                                     
                        </div>

                    </div>
                    <div class="row">

                    </div>
                </div>`
  })